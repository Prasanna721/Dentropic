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
    status: str
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    logs: List[LogEntry] = field(default_factory=list)
    final_screenshot: Optional[str] = None


class ReportsAPIService:
    """Service to extract detailed patient report from Open Dental via CUA agent."""

    def __init__(self, patient_name: str, log_callback=None):
        self.settings = get_settings()
        self.patient_name = patient_name
        self.computer: Optional[Computer] = None
        self.agent: Optional[ComputerAgent] = None
        self.is_running = False
        self.logs: List[LogEntry] = []
        self.screenshots: List[str] = []
        self.log_callback = log_callback
        self.trajectory_path: Optional[str] = None

    def _log(self, message: str, level: str = "info"):
        entry = LogEntry(timestamp=time.time(), message=message, level=level)
        self.logs.append(entry)
        logger.info(f"[ReportsAPI] {message}")
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

    async def create_agent(self, instructions: str) -> None:
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
                        if output_item.get("type") in ["computer_screenshot", "input_image"]:
                            image_url = output_item.get("image_url", "")
                            if image_url:
                                last_screenshot = image_url
                                self._log("Screenshot captured")

                elif item_type == "computer_call":
                    action = item.get("action", {})
                    action_type = action.get("type", "unknown")
                    self._log(f"Executing: {action_type}")

        self._log(f"{task_name} completed")

        if not last_screenshot:
            last_screenshot = self._get_latest_screenshot()

        return last_screenshot

    async def run(self) -> APIResult:
        """Execute the patient report extraction task in 4 steps."""
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
            self.trajectory_path = os.path.join(trajectory_base, f"reports_api_{run_id}")
            os.makedirs(self.trajectory_path, exist_ok=True)
            self._log(f"Trajectory will be saved to: {self.trajectory_path}")

            # Base instructions for the agent
            instructions = f"""
You are automating Open Dental to extract detailed patient report data.

PATIENT TO FIND: "{self.patient_name}"

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

            # ============ TASK 1: Select Patient and Navigate to Family Tab ============
            task1 = f"""
Look at the current desktop. Open Open Dental if not already open, then:
1. Wait for the application to fully load
2. Click the "Select Patient" button on the top toolbar
3. When the Select Patient dialog opens, wait for it to fully load
4. In the search field, type "{self.patient_name}" to search for the patient
5. Wait for search results to appear
6. Double-click on the patient row to select them
7. Wait for the patient record to load and the dialog to close
8. In the left navigation panel, click on "Family"
9. Wait for the Family tab to fully load
10. Take a screenshot of the Family tab showing patient info, family members, and insurance
            """
            screenshot1 = await self._run_task(task1, "Task 1: Select Patient & Family Tab")
            if screenshot1:
                self.screenshots.append(screenshot1)
                self._log("Task 1 screenshot captured (Family tab)")

            # ============ TASK 2: Navigate to Account Tab ============
            task2 = """
Continue from the current state:
1. In the left navigation panel, click on "Account"
2. Wait for the Account tab to fully load
3. Take a screenshot showing the Patient Account transactions, balances, and claims
            """
            screenshot2 = await self._run_task(task2, "Task 2: Account Tab")
            if screenshot2:
                self.screenshots.append(screenshot2)
                self._log("Task 2 screenshot captured (Account tab)")

            # ============ TASK 3: Navigate to Tx Plan Tab ============
            task3 = """
Continue from the current state:
1. In the left navigation panel, click on "Tx Plan" (Treatment Plan)
2. Wait for the Treatment Plan tab to fully load
3. Take a screenshot showing the treatment plans, procedures, fees, and insurance estimates
            """
            screenshot3 = await self._run_task(task3, "Task 3: Tx Plan Tab")
            if screenshot3:
                self.screenshots.append(screenshot3)
                self._log("Task 3 screenshot captured (Tx Plan tab)")

            # ============ TASK 4: Navigate to Appts Tab ============
            task4 = """
Continue from the current state:
1. In the left navigation panel, click on "Appts" (Appointments)
2. Wait for the Appointments tab to fully load
3. Take a screenshot showing the patient's appointments history and scheduled appointments
            """
            screenshot4 = await self._run_task(task4, "Task 4: Appts Tab")
            if screenshot4:
                self.screenshots.append(screenshot4)
                self._log("Task 4 screenshot captured (Appts tab)")

            # ============ PROCESS SCREENSHOTS WITH ANTHROPIC ============
            if self.screenshots:
                from .anthropic_processor import extract_patient_report_from_multiple

                self._log(f"Sending {len(self.screenshots)} screenshots to Anthropic for analysis...")
                report_data = await extract_patient_report_from_multiple(
                    self.screenshots, self.settings.anthropic_api_key
                )
                self._log("Extracted comprehensive patient report")

                return APIResult(
                    status="success",
                    data=report_data,
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
            logger.error(f"Reports API error: {e}")
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
        self._log("Stopping task...")
        self.is_running = False
