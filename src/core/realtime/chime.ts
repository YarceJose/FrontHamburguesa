/**
 * Soft notification sound made with Web Audio (no audio files): two gentle sine notes.
 * 'new' = new order, 'alert' = delay (a little lower, still quiet).
 */
let context: AudioContext | null = null;

export function playChime(kind: 'new' | 'alert' = 'new'): void {
  try {
    context ??= new AudioContext();
    if (context.state === 'suspended') void context.resume();
    const notes = kind === 'new' ? [660, 880] : [520, 440];
    notes.forEach((frequency, i) => {
      const start = context!.currentTime + i * 0.22;
      const osc = context!.createOscillator();
      const gain = context!.createGain();
      osc.type = 'sine';
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.12, start + 0.03); // low volume
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
      osc.connect(gain).connect(context!.destination);
      osc.start(start);
      osc.stop(start + 0.55);
    });
  } catch {
    // Audio not available (e.g. tests): stay silent
  }
}
