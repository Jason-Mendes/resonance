/**
 * The Firestore client, which holds the NZZ articles the app serves.
 *
 * Credentials work the same way as Vertex: Application Default Credentials
 * locally, and the service account automatically on Cloud Run. Unlike Vertex
 * there is no location to configure, because a Firestore database has one
 * fixed location chosen when it was created — europe-west6, Zurich.
 */
import { Firestore } from "@google-cloud/firestore";

let client: Firestore | undefined;

/**
 * Built on first use rather than at import, so a missing project id fails the
 * request that needed it instead of stopping the whole server.
 */
export function getFirestore(): Firestore {
  if (client) return client;

  const projectId = process.env.FIRESTORE_PROJECT;
  if (!projectId) {
    throw new Error(
      "FIRESTORE_PROJECT is not set. Add it to backend/.env or the deployment environment.",
    );
  }

  client = new Firestore({ projectId });
  return client;
}
