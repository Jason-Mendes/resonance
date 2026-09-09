/**
 * The Google GenAI client, in Vertex mode.
 *
 * Not the Gemini Developer API: that authenticates with an API key, and the
 * organisation policy on this project disallows API keys entirely. Vertex uses
 * Application Default Credentials instead, which is what the policy asks for.
 *
 * Locally:      gcloud auth application-default login
 *               gcloud auth application-default set-quota-project <project>
 * On Cloud Run: the service account is picked up with no configuration.
 */
import { GoogleGenAI } from "@google/genai";

const DEFAULT_LOCATION = "us-central1";

let client: GoogleGenAI | undefined;

/**
 * Built on first use rather than at import, so a missing VERTEX_PROJECT fails
 * the request that needed it instead of stopping the whole server.
 */
export function getVertexClient(): GoogleGenAI {
  if (client) return client;

  const project = process.env.VERTEX_PROJECT;
  if (!project) {
    throw new Error(
      "VERTEX_PROJECT is not set. Add it to backend/.env or the deployment environment.",
    );
  }

  client = new GoogleGenAI({
    vertexai: true,
    project,
    location: process.env.VERTEX_LOCATION ?? DEFAULT_LOCATION,
  });
  return client;
}
