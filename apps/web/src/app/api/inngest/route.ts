import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { processWhatsAppMessage } from "@/inngest/functions/process-whatsapp-message";
import { processFactoryDoc } from "@/inngest/functions/process-factory-doc";
import { weeklySummary } from "@/inngest/functions/weekly-summary";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processWhatsAppMessage, processFactoryDoc, weeklySummary],
});
