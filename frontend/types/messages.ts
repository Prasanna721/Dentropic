export enum MessageType {
  // Outgoing to backend
  START_AGENT = "start_agent",
  STOP_AGENT = "stop_agent",
  RUN_API = "run_api",

  // Incoming from backend
  SCREENSHOT = "screenshot",
  STATUS = "status",
  MESSAGE = "message",
  ERROR = "error",
  AGENT_COMPLETE = "agent_complete",
  API_LOG = "api_log",
  API_RESPONSE = "api_response",
}

export interface WebSocketMessage {
  type: MessageType;
  payload?: unknown;
  timestamp?: number;
}

export interface ScreenshotPayload {
  image_data: string;
  step: number;
}

export interface StatusPayload {
  status: "connecting" | "running" | "idle" | "error" | "completed" | "stopped";
  message?: string;
}

export interface AgentMessagePayload {
  role: "assistant" | "system" | "reasoning";
  content: string;
  action?: string;
}

export interface ConnectionState {
  isConnected: boolean;
  status: StatusPayload["status"];
  statusMessage: string;
}

// API types
export interface APILogPayload {
  message: string;
  timestamp: number;
  level: string;
}

export interface PatientData {
  patient_id?: number;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  phone?: string;
  email?: string;
  insurance?: string;
  balance?: number;
}

export interface AppointmentData {
  time?: string;
  patient_name?: string;
  procedure?: string;
  provider?: string;
  status?: string;
  duration_minutes?: number;
}

export interface APIResponsePayload {
  endpoint: string;
  status: "success" | "error";
  data?: {
    patients?: PatientData[];
    appointments?: AppointmentData[];
    [key: string]: unknown;
  };
  error?: string;
}

export interface RunAPIPayload {
  endpoint: string;
  params?: Record<string, string>;
}

// API endpoint definitions
export interface APIEndpoint {
  id: string;
  name: string;
  description: string;
}

export const API_ENDPOINTS: APIEndpoint[] = [
  {
    id: "patients",
    name: "Get Patients",
    description: "Extract patient list from Open Dental",
  },
  {
    id: "reports",
    name: "Get Reports",
    description: "Generate and extract detailed patient report from Open Dental",
  },
  {
    id: "patient_chart",
    name: "Get Patient Chart",
    description: "Extract patient chart with procedures and tooth conditions",
  },
];
