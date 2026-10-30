// Web Audio API Synthesized Mechanical Audio Feedback Engine
// Zero external audio files, zero network latency, pure acoustic synthesis.

export type SoundType = 'digit' | 'operator' | 'equals' | 'clear' | 'toggle' | 'error' | 'bit';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.4;

  constructor() {
    // Check if muted in localStorage
    try {
      const savedMute = localStorage.getItem('calcula_sound_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
    } catch {
      this.isMuted = false;
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem('calcula_sound_muted', String(muted));
    } catch {
      // ignore
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    if (!this.isMuted) {
      this.play('toggle');
    }
    return this.isMuted;
  }

  public play(type: SoundType = 'digit') {
    if (this.isMuted) return;

    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      switch (type) {
        case 'digit':
          this.playMechanicalClick(now, 720, 0.035, 0.45);
          break;
        case 'operator':
          this.playMechanicalThock(now, 460, 0.045, 0.55);
          break;
        case 'equals':
          this.playChordPitched(now, [587.33, 880], 0.08, 0.5);
          break;
        case 'clear':
          this.playMechanicalSnap(now, 380, 0.04, 0.5);
          break;
        case 'bit':
          this.playBitClick(now, 920, 0.025, 0.35);
          break;
        case 'toggle':
          this.playTone(now, 880, 0.03, 0.3);
          break;
        case 'error':
          this.playErrorBuzz(now);
          break;
      }
    } catch (e) {
      // Audio might fail in background or unsupported environments gracefully
      console.warn('Audio feedback error', e);
    }
  }

  // Synthesizes a mechanical switch tactile click: sharp transient click + low body thock
  private playMechanicalClick(startTime: number, freq: number, duration: number, volFactor: number) {
    if (!this.ctx) return;

    // Transient click burst
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(freq * 2.4, startTime);
    clickOsc.frequency.exponentialRampToValueAtTime(freq * 0.8, startTime + duration);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, startTime);
    filter.Q.setValueAtTime(3.0, startTime);

    const actualVol = this.volume * volFactor;
    clickGain.gain.setValueAtTime(actualVol, startTime);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    clickOsc.connect(filter);
    filter.connect(clickGain);
    clickGain.connect(this.ctx.destination);

    clickOsc.start(startTime);
    clickOsc.stop(startTime + duration + 0.01);

    // Subtle low casing bottom-out thud
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(140, startTime);
    subOsc.frequency.exponentialRampToValueAtTime(60, startTime + 0.04);

    subGain.gain.setValueAtTime(actualVol * 0.35, startTime);
    subGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.04);

    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);

    subOsc.start(startTime);
    subOsc.stop(startTime + 0.05);
  }

  // Deeper mechanical operator switch (e.g. cherry black / tactile thock)
  private playMechanicalThock(startTime: number, freq: number, duration: number, volFactor: number) {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.4, startTime + duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, startTime);

    const actualVol = this.volume * volFactor;
    gain.gain.setValueAtTime(actualVol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
  }

  private playMechanicalSnap(startTime: number, freq: number, duration: number, volFactor: number) {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq * 1.5, startTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, startTime + duration);

    const actualVol = this.volume * volFactor;
    gain.gain.setValueAtTime(actualVol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
  }

  private playBitClick(startTime: number, freq: number, duration: number, volFactor: number) {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.7, startTime + duration);

    const actualVol = this.volume * volFactor;
    gain.gain.setValueAtTime(actualVol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
  }

  private playTone(startTime: number, freq: number, duration: number, volFactor: number) {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    const actualVol = this.volume * volFactor;
    gain.gain.setValueAtTime(actualVol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
  }

  private playChordPitched(startTime: number, frequencies: number[], duration: number, volFactor: number) {
    if (!this.ctx) return;

    frequencies.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const noteStart = startTime + i * 0.02;
      osc.frequency.setValueAtTime(freq, noteStart);

      const actualVol = (this.volume * volFactor) / frequencies.length;
      gain.gain.setValueAtTime(actualVol, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteStart);
      osc.stop(noteStart + duration + 0.01);
    });
  }

  private playErrorBuzz(startTime: number) {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, startTime);
    osc.frequency.setValueAtTime(110, startTime + 0.06);

    gain.gain.setValueAtTime(this.volume * 0.3, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.15);
  }
}

export const soundEngine = new SoundEngine();
