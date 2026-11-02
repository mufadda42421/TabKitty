/**
 * TabKitty Web Audio Synthesizer
 * Produces cozy feline sound effects without any external audio asset dependencies.
 */

class SoundEffects {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public volume: number = 0.7;

  private getContext(): AudioContext | null {
    if (!this.enabled || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Soft purr resonance
  purr() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(115, now);
      osc.frequency.exponentialRampToValueAtTime(155, now + 0.14);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.28);

      const targetVol = 0.14 * this.volume;
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(targetVol, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.32);
    } catch {}
  }

  // Cute meow chirp
  meow() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(390, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.28);

      const targetVol = 0.16 * this.volume;
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(targetVol, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  // Soft pop paw swipe
  pop() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);

      const targetVol = 0.15 * this.volume;
      gain.gain.setValueAtTime(targetVol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  }

  // Golden bell chime for pinning tabs
  bell() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.08);

      const targetVol = 0.12 * this.volume;
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(targetVol, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  }

  // Feather wand chirp
  chirp() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(2400, now + 0.05);
      osc.frequency.exponentialRampToValueAtTime(1600, now + 0.12);

      const targetVol = 0.1 * this.volume;
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(targetVol, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    } catch {}
  }

  // Laser sparkle
  laser() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(990, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.1);

      const targetVol = 0.08 * this.volume;
      gain.gain.setValueAtTime(targetVol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch {}
  }
}

export const sounds = new SoundEffects();
