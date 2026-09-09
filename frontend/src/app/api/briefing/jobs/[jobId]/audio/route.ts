import { NextResponse } from "next/server";

import { BackendError, streamFromBackend } from "@/lib/backend";

interface RouteParams {
  params: { jobId: string };
}

/**
 * The rendered briefing, streamed through. MP3 rather than the dialogue's WAV,
 * since a briefing is synthesised by Cloud TTS rather than by Gemini.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const upstream = await streamFromBackend(`/api/briefing/jobs/${params.jobId}/audio`);

    return new Response(upstream.body, {
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") ?? "audio/mpeg",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Briefing audio proxy error:", error);
    return NextResponse.json({ error: "Could not reach the audio service" }, { status: 502 });
  }
}
