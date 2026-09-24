import OpenAI, { toFile } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const TRANSCRIPTION_MODEL = "whisper-1";

export async function transcribeAudio(base64Data: string, mimeType: string): Promise<string> {
  const buffer = Buffer.from(base64Data, "base64");
  const extension = mimeType.split("/")[1] ?? "ogg"; // WhatsApp voice notes arrive as audio/ogg
  const file = await toFile(buffer, `audio.${extension}`);

  const res = await openai.audio.transcriptions.create({
    model: TRANSCRIPTION_MODEL,
    file,
    language: "es",
  });

  return res.text;
}
