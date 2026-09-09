import { NextResponse } from "next/server";

import { BackendError, getFromBackend } from "@/lib/backend";

interface RouteParams {
  params: { jobId: string };
}

/** Job status, polled by the studio until the render is done or has failed. */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const job: unknown = await getFromBackend(`/api/tts/jobs/${params.jobId}`);
    return NextResponse.json(job);
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("TTS status proxy error:", error);
    return NextResponse.json({ error: "Could not reach the audio service" }, { status: 502 });
  }
}
