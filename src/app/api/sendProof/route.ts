import { NextRequest, NextResponse } from "next/server";
import fetch from "node-fetch";
import FormDataNode from "form-data";

// ✅ Telegram API response type
interface TelegramResponse {
  ok: boolean;
  result?: unknown;
  description?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ ok: false, error: "No file provided" });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

    const tgForm = new FormDataNode();
    tgForm.append("chat_id", TELEGRAM_CHAT_ID);
    tgForm.append("photo", buffer, {
      filename: file.name,
      contentType: file.type || "image/jpeg",
    });

    const tgRes = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`,
      { method: "POST", body: tgForm }
    );

    // Safely parse JSON
    let tgData: TelegramResponse;
    try {
      tgData = (await tgRes.json()) as TelegramResponse;
    } catch (jsonErr) {
      console.error("Failed to parse Telegram response:", jsonErr);
      return NextResponse.json({
        ok: false,
        error: "Invalid response from Telegram",
      });
    }

    // Check if Telegram responded with OK
    if (!tgData || !tgData.ok) {
      console.error("Telegram API error:", tgData);
      return NextResponse.json({
        ok: false,
        error: tgData?.description || "Unknown error",
      });
    }

    return NextResponse.json({ ok: true, result: tgData.result });
  } catch (err) {
    console.error("sendProof error:", err);
    return NextResponse.json({ ok: false, error: "Server error" });
  }
}
