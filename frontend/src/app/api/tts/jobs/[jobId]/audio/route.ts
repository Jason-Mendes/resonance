import { NextResponse } from "next/server";

import { BackendError, streamFromBackend } from "@/lib/backend";

interface RouteParams {
  params: { jobId: string };
}

/**
 * The rendered audio, streamed straight through. This URL is the `src` of the
 * player's audio element, so the browser requests it directly and expects the
 * bytes rather than JSON.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const upstream = await streamFromBackend(`/api/tts/jobs/${params.jobId}/audio`);

    return new Response(upstream.body, {
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") ?? "audio/wav",
        // The audio for a job id never changes, so let the browser keep it and
        // make scrubbing back through the track free.
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("TTS audio proxy error:", error);
    return NextResponse.json({ error: "Could not reach the audio service" }, { status: 502 });
  }
}
