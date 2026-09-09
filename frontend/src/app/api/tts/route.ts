import { NextResponse } from "next/server";

import { BackendError, postToBackend } from "@/lib/backend";

/**
 * Starts a text-to-speech job. Unlike the script route this forwards a script
 * from the client, because the studio lets a producer edit turns before
 * rendering audio and the edited text is the point. The backend caps turn count
 * and turn length, and /api is rate limited, which is what bounds the cost.
 */

interface JobAccepted {
  jobId: string;
  status: string;
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const script = (body as { script?: unknown })?.script;

  if (!Array.isArray(script) || script.length === 0) {
    return NextResponse.json({ error: "script must be a non-empty array" }, { status: 400 });
  }

  try {
    const job = await postToBackend<JobAccepted>("/api/tts", { script });
    return NextResponse.json(job, { status: 202 });
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("TTS proxy error:", error);
    return NextResponse.json({ error: "Could not reach the audio service" }, { status: 502 });
  }
}
