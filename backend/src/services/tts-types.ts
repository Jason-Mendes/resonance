export interface ScriptTurn {
  speaker: string;
  text: string;
}

export interface RenderedAudio {
  audio: Buffer;
  mimeType: string;
}

export interface NarratedAudio extends RenderedAudio {
  text: string;
}
