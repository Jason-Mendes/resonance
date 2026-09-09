/**
 * An error whose message was written for the person who caused it.
 *
 * Everything else is internal by default. A Vertex SDK error names models,
 * project ids and quota state, none of which belongs in a response to an
 * anonymous caller, so the job runner replaces it with a generic sentence.
 * Extending this class is the deliberate act of saying "this one is safe".
 */
export class PublicError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PublicError";
  }
}

/**
 * A failure that may well not happen again: a timeout, a rate limit, a 503
 * from an overloaded model. Worth telling the caller to try again, which a
 * flat "generation failed" cannot.
 */
export class TransientError extends PublicError {
  constructor(message: string) {
    super(message);
    this.name = "TransientError";
  }
}
