// Web Audio API Synthesizer for Project Kontur
// Creates authentic industrial horror soundscapes without external audio files.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private humOsc1: OscillatorNode | null = null;
  private humOsc2: OscillatorNode | null = null;
  private humGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isHumming: boolean = false;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.isHumming) {
      this.stopTransformerHum();
    } else if (!muted && !this.isHumming) {
      this.startTransformerHum(0.04);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // Short mechanical dispatcher click
  public playClick(freq = 900) {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.035);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Audio context might be restricted before interaction
    }
  }

  // Mechanical keyboard clack
  public playKeypress() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const baseFreq = 400 + Math.random() * 250;
      osc.type = 'square';
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.025);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    } catch {}
  }

  // Terminal notification beep
  public playBeep(freq = 1200, duration = 0.08) {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }

  // Continuous background 50Hz mains hum
  public startTransformerHum(volume = 0.04) {
    if (this.isMuted || this.isHumming) return;
    try {
      const ctx = this.getContext();
      this.humGain = ctx.createGain();
      this.humGain.gain.setValueAtTime(volume, ctx.currentTime);

      this.humOsc1 = ctx.createOscillator();
      this.humOsc1.type = 'sawtooth';
      this.humOsc1.frequency.setValueAtTime(50, ctx.currentTime); // 50 Hz Soviet electrical grid

      this.humOsc2 = ctx.createOscillator();
      this.humOsc2.type = 'sine';
      this.humOsc2.frequency.setValueAtTime(100, ctx.currentTime); // 2nd harmonic

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, ctx.currentTime);

      this.humOsc1.connect(filter);
      this.humOsc2.connect(filter);
      filter.connect(this.humGain);
      this.humGain.connect(ctx.destination);

      this.humOsc1.start();
      this.humOsc2.start();
      this.isHumming = true;
    } catch {}
  }

  public stopTransformerHum() {
    try {
      if (this.humOsc1) {
        this.humOsc1.stop();
        this.humOsc1.disconnect();
        this.humOsc1 = null;
      }
      if (this.humOsc2) {
        this.humOsc2.stop();
        this.humOsc2.disconnect();
        this.humOsc2 = null;
      }
      if (this.humGain) {
        this.humGain.disconnect();
        this.humGain = null;
      }
      this.isHumming = false;
    } catch {}
  }

  // Alarm siren (pulsing low alert)
  public playAlarm(times = 3) {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      for (let i = 0; i < times; i++) {
        const startTime = ctx.currentTime + i * 0.45;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260, startTime);
        osc.frequency.exponentialRampToValueAtTime(190, startTime + 0.35);

        gain.gain.setValueAtTime(0.08, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.38);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(700, startTime);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.4);
      }
    } catch {}
  }

  // Radio static and noise burst
  public playStatic(duration = 0.4, intensity = 0.05) {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, ctx.currentTime);
      filter.Q.setValueAtTime(1.5, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(intensity, ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch {}
  }

  // Radio scanning tone with whistling heterodyne
  public playRadioTuner(frequencyMHz: number, isTunedTo104_2: boolean) {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const diff = Math.abs(frequencyMHz - 104.2);

      // Heterodyne whistle
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const whistleFreq = Math.min(3000, 150 + diff * 1200);
      osc.type = isTunedTo104_2 ? 'sine' : 'sawtooth';
      osc.frequency.setValueAtTime(whistleFreq, ctx.currentTime);

      const vol = isTunedTo104_2 ? 0.03 : Math.max(0.01, 0.05 - diff * 0.015);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.12);

      // Add static noise
      this.playStatic(0.08, isTunedTo104_2 ? 0.015 : 0.04);
    } catch {}
  }

  // Deep Sub-Bass Impact / Horror Screamer Thud
  public playScreamerThud() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(28, ctx.currentTime + 0.7);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.2);

      // Add high eerie dissonant spike
      const dissonant = ctx.createOscillator();
      const disGain = ctx.createGain();
      dissonant.type = 'sawtooth';
      dissonant.frequency.setValueAtTime(1420, ctx.currentTime);
      dissonant.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.5);

      disGain.gain.setValueAtTime(0.07, ctx.currentTime);
      disGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      dissonant.connect(disGain);
      disGain.connect(ctx.destination);

      dissonant.start();
      dissonant.stop(ctx.currentTime + 0.5);
    } catch {}
  }

  // Glitch effect audio
  public playGlitch() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.setValueAtTime(840, ctx.currentTime + 0.03);
      osc.frequency.setValueAtTime(220, ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }

  // Creepy Heartbeat double-thud
  public playHeartbeat() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const times = [0, 0.22];
      times.forEach((offset) => {
        const t = ctx.currentTime + offset;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(75, t);
        osc.frequency.exponentialRampToValueAtTime(35, t + 0.14);

        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.16);
      });
    } catch {}
  }

  // Simulated radio voice distortion (whisper/garbled transmission)
  public playVoiceTransmission(pitch = 280, duration = 1.2) {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(pitch, ctx.currentTime);
      // FM modulation
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(12, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(45, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(950, ctx.currentTime);
      filter.Q.setValueAtTime(3, ctx.currentTime);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      lfo.start();
      osc.start();
      lfo.stop(ctx.currentTime + duration);
      osc.stop(ctx.currentTime + duration);

      this.playStatic(duration, 0.02);
    } catch {}
  }
}

export const sound = new SoundEngine();
