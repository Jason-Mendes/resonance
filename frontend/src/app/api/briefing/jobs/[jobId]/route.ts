import { NextResponse } from "next/server";

import { BackendError, getFromBackend } from "@/lib/backend";

interface RouteParams {
  params: { jobId: string };
}

/** Job status, and once done the narrated text alongside it. */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const job: unknown = await getFromBackend(`/api/briefing/jobs/${params.jobId}`);
    return NextResponse.json(job);
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Briefing status proxy error:", error);
    return NextResponse.json({ error: "Could not reach the audio service" }, { status: 502 });
  }
}
