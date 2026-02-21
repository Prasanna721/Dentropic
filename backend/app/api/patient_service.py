import asyncio
import logging
import os
import ssl
import certifi
import glob
import base64
from typing import AsyncGenerator, Optional, List, Dict, Any
from dataclasses import dataclass, field
from datetime import datetime
import time

# Fix SSL certificate verification for macOS
os.environ["SSL_CERT_FILE"] = certifi.where()
os.environ["REQUESTS_CA_BUNDLE"] = certifi.where()

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
    status: str  # "success", "error"
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    logs: List[LogEntry] = field(default_factory=list)
    final_screenshot: Optional[str] = None


class PatientAPIService:
    """Service to extract patient data from Open Dental via CUA agent."""

    def __init__(self, log_callback=None):
        self.settings = get_settings()
        self.computer: Optional[Computer] = None
        self.agent: Optional[ComputerAgent] = None
        self.is_running = False
        self.logs: List[LogEntry] = []
        self.screenshots: List[str] = []  # Store multiple screenshots
        self.log_callback = log_callback
        self.trajectory_path: Optional[str] = None

    def _log(self, message: str, level: str = "info"):
        """Add a log entry and optionally stream it."""
        entry = LogEntry(timestamp=time.time(), message=message, level=level)
        self.logs.append(entry)
        logger.info(f"[PatientAPI] {message}")
        if self.log_callback:
            asyncio.create_task(self.log_callback(entry))

    def _get_latest_screenshot(self) -> Optional[str]:
        """Read the latest screenshot from saved trajectory."""
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
        """Initialize the Computer connection to the cloud sandbox."""
        self._log("Connecting to Windows sandbox...")
        self.computer = Computer(
            os_type="windows",
            provider_type="cloud",
            name=self.settings.cua_sandbox_name,
            api_key=self.settings.cua_api_key,
        )

    async def create_agent(self, instructions: str) -> None:
        """Create the ComputerAgent with given instructions."""
        if not self.computer:
            raise RuntimeError("Computer not initialized")

        self.agent = ComputerAgent(
            model="cua/anthropic/claude-sonnet-4.5",
            tools=[self.computer],
            only_n_most_recent_images=2,
            max_trajectory_budget=15.0,
            instructions=instructions,
            trajectory_dir=self.trajectory_path,
        )

    async def _run_task(self, task: str, task_name: str) -> Optional[str]:
        """Run a single task and return the final screenshot."""
        self._log(f"Starting {task_name}...")

        messages = [{"role": "user", "content": task}]
        last_screenshot = None

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
                        if output_item.get("type") in [
                            "computer_screenshot",
                            "input_image",
                        ]:
                            image_url = output_item.get("image_url", "")
                            if image_url:
                                last_screenshot = image_url
                                self._log("Screenshot captured")

                elif item_type == "computer_call":
                    action = item.get("action", {})
                    action_type = action.get("type", "unknown")
                    self._log(f"Executing: {action_type}")

        self._log(f"{task_name} completed")

        # If no screenshot from stream, get from trajectory
        if not last_screenshot:
            last_screenshot = self._get_latest_screenshot()

        return last_screenshot

    async def run(self) -> APIResult:
        """Execute the patient data extraction task in 3 steps."""
        self.is_running = True
        self.logs = []
        self.screenshots = []

        try:
            await self.initialize()
            self._log("Starting sandbox connection...")
            await self.computer.run()
            self._log("Sandbox connected successfully")

            # Setup trajectory path
            trajectory_base = os.path.join(
                os.path.dirname(__file__), "..", "..", "trajectories"
            )
            run_id = datetime.now().strftime("%Y%m%d_%H%M%S")
            self.trajectory_path = os.path.join(
                trajectory_base, f"patient_api_{run_id}"
            )
            os.makedirs(self.trajectory_path, exist_ok=True)
            self._log(f"Trajectory will be saved to: {self.trajectory_path}")

            # Base instructions for the agent
            instructions = """
You are automating Open Dental to navigate and capture patient data.

IMPORTANT GUIDELINES:
- Always wait for windows and dialogs to fully load before interacting
- Look for loading indicators and wait for them to disappear
- Verify each action by checking on-screen confirmation
- If a button or element is not visible, try scrolling or looking for it
- Take screenshots to verify your progress
            """.strip()

            # Create agent
            self._log("Creating CUA agent...")
            await self.create_agent(instructions)

            # ============ TASK 1: Open Select Patient Dialog ============
            task1 = """
Look at the current desktop. Open Open Dental if not already open, then:
1. Wait for the application to fully load
2. Click the "Select Patient" button on the top toolbar
3. When the Select Patient dialog opens, wait for it to fully load
4. Take a screenshot of the Select Patient dialog
            """
            screenshot1 = await self._run_task(
                task1, "Task 1: Open Select Patient Dialog"
            )
            if screenshot1:
                self.screenshots.append(screenshot1)
                self._log("Task 1 screenshot captured")

            # ============ TASK 2: Scroll Right to See More Columns ============
            task2 = """
Continue from the current state:
1. In the Select Patient dialog, click on the bottom horizontal scrollbar
            """
            screenshot2 = await self._run_task(task2, "Task 2: Scroll Right")
            if screenshot2:
                self.screenshots.append(screenshot2)
                self._log("Task 2 screenshot captured")

            # ============ TASK 3: Close Dialog ============
            task3 = """
Continue from the current state:
1. Close the Select Patient dialog by clicking the X button or pressing Escape
2. Wait for the dialog to close and return to the main Open Dental window
            """
            await self._run_task(task3, "Task 3: Close Dialog")
            self._log("Task 3 completed - dialog closed")

            # ============ PROCESS SCREENSHOTS WITH ANTHROPIC ============
            if self.screenshots:
                from .anthropic_processor import extract_patient_data_from_multiple

                self._log(
                    f"Sending {len(self.screenshots)} screenshots to Anthropic for analysis..."
                )
                patient_data = await extract_patient_data_from_multiple(
                    self.screenshots, self.settings.anthropic_api_key
                )
                self._log(f"Extracted {len(patient_data.get('patients', []))} patients")

                return APIResult(
                    status="success",
                    data=patient_data,
                    logs=self.logs,
                    final_screenshot=self.screenshots[-1] if self.screenshots else None,
                )
            else:
                self._log("No screenshots captured", level="error")
                return APIResult(
                    status="error",
                    error="No screenshots captured during task execution",
                    logs=self.logs,
                )

        except Exception as e:
            error_msg = str(e)
            self._log(f"Error: {error_msg}", level="error")
            logger.error(f"Patient API error: {e}")
            return APIResult(status="error", error=error_msg, logs=self.logs)
        finally:
            self.is_running = False
            if self.computer:
                try:
                    await self.computer.disconnect()
                    self._log("Disconnected from sandbox")
                except Exception as e:
                    logger.error(f"Error disconnecting: {e}")

    async def stop(self) -> None:
        """Stop the running task."""
        self._log("Stopping task...")
        self.is_running = False
