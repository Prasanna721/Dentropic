import asyncio
import logging
import os
import ssl
import certifi
import glob
import base64
from typing import Optional, List, Dict, Any
from dataclasses import dataclass, field
from datetime import datetime
import time

os.environ['SSL_CERT_FILE'] = certifi.where()
os.environ['REQUESTS_CA_BUNDLE'] = certifi.where()

from computer import Computer
from agent import ComputerAgent
from ..config import get_settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class LogEntry:
    timestamp: float
    message: str
    level: str = "info"


@dataclass
class APIResult:
    status: str
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    logs: List[LogEntry] = field(default_factory=list)
    final_screenshot: Optional[str] = None


class AppointmentAPIService:
    """Service to extract appointment data from Open Dental via CUA agent."""

    def __init__(self, log_callback=None):
        self.settings = get_settings()
        self.computer: Optional[Computer] = None
        self.agent: Optional[ComputerAgent] = None
        self.is_running = False
        self.logs: List[LogEntry] = []
        self.final_screenshot: Optional[str] = None
        self.log_callback = log_callback
        self.trajectory_path: Optional[str] = None

    def _log(self, message: str, level: str = "info"):
        entry = LogEntry(timestamp=time.time(), message=message, level=level)
        self.logs.append(entry)
        logger.info(f"[AppointmentAPI] {message}")
        if self.log_callback:
            asyncio.create_task(self.log_callback(entry))

    def _get_latest_screenshot(self) -> Optional[str]:
        if not self.trajectory_path or not os.path.exists(self.trajectory_path):
            return None

        pattern = os.path.join(self.trajectory_path, "**", "*.png")
        screenshots = glob.glob(pattern, recursive=True)

        if not screenshots:
            return None

        latest = max(screenshots, key=os.path.getmtime)
        self._log(f"Found screenshot: {latest}")

        with open(latest, "rb") as f:
            image_data = base64.b64encode(f.read()).decode("utf-8")

        return f"data:image/png;base64,{image_data}"

    async def initialize(self) -> None:
        self._log("Connecting to Windows sandbox...")
        self.computer = Computer(
            os_type="windows",
            provider_type="cloud",
            name=self.settings.cua_sandbox_name,
            api_key=self.settings.cua_api_key,
        )

    async def create_agent(self) -> None:
        if not self.computer:
            raise RuntimeError("Computer not initialized")

        self._log("Creating CUA agent...")

        trajectory_base = os.path.join(os.path.dirname(__file__), "..", "..", "trajectories")
        run_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.trajectory_path = os.path.join(trajectory_base, f"appointment_api_{run_id}")
        os.makedirs(self.trajectory_path, exist_ok=True)
        self._log(f"Trajectory will be saved to: {self.trajectory_path}")

        instructions = """
You are automating Open Dental to extract appointment data.

TASK: Open the appointment schedule and capture today's appointments.

STEPS:
1. Look at the current screen
2. If Open Dental is not open:
   - Press Windows key and search for "Open Dental"
   - Open the application
3. Once Open Dental is open:
   - Click on "Appointments" in the main navigation
   - Or look for the schedule/calendar view
4. When the appointment schedule opens:
   - Make sure you're viewing today's date
   - Wait for it to fully load
   - Take a screenshot showing the appointment schedule
   - The schedule should show patient names, times, procedures

IMPORTANT:
- Always wait for windows and dialogs to fully load
- If Open Dental is already open, navigate to appointments
- Take a clear screenshot of the schedule
        """.strip()

        self.agent = ComputerAgent(
            model="cua/anthropic/claude-sonnet-4.5",
            tools=[self.computer],
            only_n_most_recent_images=2,
            max_trajectory_budget=15.0,
            instructions=instructions,
            trajectory_dir=self.trajectory_path,
        )

    async def run(self) -> APIResult:
        self.is_running = True
        self.logs = []
        self.final_screenshot = None

        try:
            await self.initialize()
            self._log("Starting sandbox connection...")
            await self.computer.run()
            self._log("Sandbox connected successfully")

            await self.create_agent()
            self._log("Agent initialized, starting task...")

            task = """
Look at the current desktop. Open Open Dental if not already open, then:
1. Navigate to the Appointments/Schedule view
2. Make sure you're viewing today's appointments
3. Take a screenshot of the appointment schedule.

Take a final screenshot showing the appointments clearly.
            """

            messages = [{"role": "user", "content": task}]

            async for result in self.agent.run(messages):
                if not self.is_running:
                    break

                for item in result.get("output", []):
                    item_type = item.get("type", "")

                    if item_type == "message":
                        content = item.get("content", [])
                        for block in content:
                            text = block.get("text", "") or block.get("output_text", "")
                            if text:
                                self._log(f"Agent: {text[:200]}...")

                    elif item_type == "computer_call_output":
                        output_content = item.get("content", [])
                        for output_item in output_content:
                            if output_item.get("type") in ["computer_screenshot", "input_image"]:
                                image_url = output_item.get("image_url", "")
                                if image_url:
                                    self.final_screenshot = image_url
                                    self._log("Screenshot captured")

                    elif item_type == "computer_call":
                        action = item.get("action", {})
                        action_type = action.get("type", "unknown")
                        self._log(f"Executing: {action_type}")

            self._log("Task completed, reading screenshot from trajectory...")

            self.final_screenshot = self._get_latest_screenshot()

            if self.final_screenshot:
                from .anthropic_processor import extract_appointment_data
                self._log("Sending screenshot to Anthropic for analysis...")
                appointment_data = await extract_appointment_data(
                    self.final_screenshot,
                    self.settings.anthropic_api_key
                )
                self._log(f"Extracted {len(appointment_data.get('appointments', []))} appointments")

                return APIResult(
                    status="success",
                    data=appointment_data,
                    logs=self.logs,
                    final_screenshot=self.final_screenshot
                )
            else:
                self._log(f"No screenshot found", level="error")
                return APIResult(
                    status="error",
                    error="No screenshot found",
                    logs=self.logs
                )

        except Exception as e:
            error_msg = str(e)
            self._log(f"Error: {error_msg}", level="error")
            logger.error(f"Appointment API error: {e}")
            return APIResult(
                status="error",
                error=error_msg,
                logs=self.logs
            )
        finally:
            self.is_running = False
            if self.computer:
                try:
                    await self.computer.disconnect()
                    self._log("Disconnected from sandbox")
                except Exception as e:
                    logger.error(f"Error disconnecting: {e}")

    async def stop(self) -> None:
        self._log("Stopping task...")
        self.is_running = False
