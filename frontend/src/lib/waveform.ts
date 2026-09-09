/**
 * Reads peak amplitudes off rendered audio so the player draws the real shape
 * of the episode. Runs in the browser: it needs the Web Audio API to decode.
 */

// Matches the bar count the waveform component was designed around, so the
// strip keeps the chunky proportions of the original studio design.
const BAR_COUNT = 20;
const MIN_BAR_HEIGHT = 8;
const MAX_BAR_HEIGHT = 100;

/**
 * Root mean square per bucket, not peak. At twenty bars each bucket spans
 * several seconds of speech and reliably contains at least one loud syllable,
 * so peaks saturate and every bar comes out near the top. RMS measures how much
 * of the bucket is sound rather than pause, which is what varies across an
 * episode. Measured on a rendered two-minute dialogue: RMS spread 0.57, peak
 * spread 0.34.
 */
const bucketLoudness = (samples: Float32Array, barCount: number): number[] => {
  const bucketSize = Math.floor(samples.length / barCount);
  if (bucketSize === 0) return [];

  const levels: number[] = [];
  for (let bar = 0; bar < barCount; bar += 1) {
    const start = bar * bucketSize;
    let sumOfSquares = 0;
    for (let i = start; i < start + bucketSize; i += 1) {
      sumOfSquares += samples[i] * samples[i];
    }
    levels.push(Math.sqrt(sumOfSquares / bucketSize));
  }
  return levels;
};

/** Scales levels to the 0-100 the waveform component expects. */
const toBarHeights = (levels: number[]): number[] => {
  const loudest = Math.max(...levels);
  // Silent audio has no shape to normalise against, and dividing by its zero
  // level would make every bar NaN.
  if (loudest === 0) return levels.map(() => MIN_BAR_HEIGHT);

  return levels.map((level) =>
    Math.max(MIN_BAR_HEIGHT, Math.round((level / loudest) * MAX_BAR_HEIGHT)),
  );
};

export const extractWaveform = async (audioUrl: string): Promise<number[]> => {
  const response = await fetch(audioUrl);
  const encoded = await response.arrayBuffer();

  const context = new AudioContext();
  try {
    const decoded = await context.decodeAudioData(encoded);
    // Both hosts share one mono track, so the first channel is the whole mix.
    return toBarHeights(bucketLoudness(decoded.getChannelData(0), BAR_COUNT));
  } finally {
    void context.close();
  }
};
