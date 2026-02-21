import { anthropic } from "@ai-sdk/anthropic";
import { convertToModelMessages, streamText } from "ai";
import { z } from "zod";

export const maxDuration = 120;

const SYSTEM_PROMPT = `You are an AI assistant for OpenDental, a dental practice management system. You help dental professionals manage patients, view reports, and access patient charts.

When users ask about patients, use the get_patients tool to search for them.
When users want to see a patient report, use the get_reports tool.
When users want to see a patient's dental chart, use the get_patient_chart tool.

Be helpful, professional, and proactive in offering to look up information.`;

// Tool schemas
const getPatientsSchema = z.object({
  query: z.string().optional().describe("Search query for patient name (optional - leave empty to get all patients)"),
});

const getReportsSchema = z.object({
  patientName: z.string().describe("The patient name to generate report for"),
});

const getPatientChartSchema = z.object({
  patientName: z.string().describe("The patient name to get chart for"),
});

export async function POST(req: Request) {
  const { messages, system } = await req.json();

  const convertedMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: system || SYSTEM_PROMPT,
    messages: convertedMessages,
    tools: {
      get_patients: {
        description: "Search for patients by name or get a list of patients from the dental practice management system",
        inputSchema: getPatientsSchema,
        execute: async (args: z.infer<typeof getPatientsSchema>) => {
          // Return action descriptor - frontend will execute via WebSocket
          return {
            action: "patients",
            query: args.query || "",
            status: "pending",
          };
        },
      },
      get_reports: {
        description: "Generate and retrieve a detailed patient report including medical history, allergies, conditions, and treatment plan. You can use the patient's name directly.",
        inputSchema: getReportsSchema,
        execute: async (args: z.infer<typeof getReportsSchema>) => {
          return {
            action: "reports",
            patientName: args.patientName,
            status: "pending",
          };
        },
      },
      get_patient_chart: {
        description: "Get the dental chart for a patient showing tooth conditions, procedures, and treatment history. You can use the patient's name directly.",
        inputSchema: getPatientChartSchema,
        execute: async (args: z.infer<typeof getPatientChartSchema>) => {
          return {
            action: "patient_chart",
            patientName: args.patientName,
            status: "pending",
          };
        },
      },
    },
  });

  return result.toUIMessageStreamResponse();
}
