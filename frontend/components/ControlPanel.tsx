"use client";

import { ConnectionState } from "@/types/messages";
import StatusIndicator from "./StatusIndicator";
import InstallButton from "./InstallButton";

interface ControlPanelProps {
  connectionState: ConnectionState;
  onReconnect: () => void;
  onStart: () => void;
  onStop: () => void;
}

export default function ControlPanel({
  connectionState,
  onReconnect,
  onStart,
  onStop,
}: ControlPanelProps) {
  const isRunning = connectionState.status === "running";
  return (
    <div className="h-full flex flex-col bg-[#0D0D0D]">
      {/* Header */}
      <div className="p-4 border-b border-[#4A4A4A]">
        <h1 className="text-xl font-bold text-white">OpenDental CUA</h1>
        <p className="text-sm text-[#999999] mt-1">API Control Panel</p>
      </div>

      {/* Status */}
      <div className="p-4 border-b border-[#4A4A4A]">
        <StatusIndicator
          isConnected={connectionState.isConnected}
          status={connectionState.status}
          message={connectionState.statusMessage}
        />
      </div>

      {/* Launch Open Dental Button */}
      <div className="p-4 border-b border-[#4A4A4A]">
        <InstallButton
          isRunning={isRunning}
          isConnected={connectionState.isConnected}
          onStart={onStart}
          onStop={onStop}
        />
      </div>

      {/* Reconnect button when disconnected */}
      {!connectionState.isConnected && (
        <div className="p-4 border-b border-[#4A4A4A]">
          <button
            onClick={onReconnect}
            className="w-full py-2 px-4 bg-[#333333] border border-[#4A4A4A] text-white hover:bg-[#444444] transition-colors cursor-pointer"
          >
            Reconnect
          </button>
        </div>
      )}

      {/* Info section */}
      <div className="flex-1 p-4">
        <h2 className="text-sm font-semibold text-[#999999] uppercase tracking-wide mb-3">
          APIs
        </h2>
        <div className="space-y-2 text-sm text-[#666666]">
          <p>
            <strong className="text-[#999999]">Get Patients:</strong> Opens patient list and extracts patient data as JSON.
          </p>
          <p>
            <strong className="text-[#999999]">Get Reports:</strong> Extracts detailed patient report (Family, Account, Tx Plan, Appts).
          </p>
          <p>
            <strong className="text-[#999999]">Get Patient Chart:</strong> Extracts patient chart with procedures and tooth conditions.
          </p>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-[#999999] uppercase tracking-wide mb-2">
            HTTP Endpoints
          </h3>
          <div className="font-mono text-xs bg-[#1A1A1A] p-3 border border-[#4A4A4A] space-y-3">
            <div>
              <p className="text-[#16A34A]">POST /api/patients</p>
              <p className="text-[#666666] mt-1">Returns patient list from Open Dental</p>
            </div>
            <div>
              <p className="text-[#16A34A]">POST /api/reports?patient_name=...</p>
              <p className="text-[#666666] mt-1">Returns detailed patient report</p>
            </div>
            <div>
              <p className="text-[#16A34A]">POST /api/patient_chart?patient_name=...</p>
              <p className="text-[#666666] mt-1">Returns patient chart with procedures</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
