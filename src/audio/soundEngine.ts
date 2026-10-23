// Web Audio API Synthesizer for Project Kontur
// Creates authentic industrial horror soundscapes without external audio files.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private humOsc1: OscillatorNode | null = null;
  private humOsc2: OscillatorNode | null = null;
  private humGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isHumming: boolean = false;
  private wasHummingBeforeMute: boolean = false;
  private humVolume: number = 0.04;
  private volume: number = 0.8;

  public getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx =
        typeof window !== 'undefined'
          ? window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext })?.webkitAudioContext
          : null;
      if (!AudioCtx) {
        throw new Error('AudioContext not supported in this environment');
      }
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public getDestination(): AudioNode {
    this.getContext();
    return this.masterGain || this.ctx!.destination;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.masterGain && !this.isMuted) {
      if (typeof this.masterGain.gain.setTargetAtTime === 'function') {
        this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.02);
      } else {
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      }
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ctx && this.masterGain) {
      const target = muted ? 0 : this.volume;
      if (typeof this.masterGain.gain.setTargetAtTime === 'function') {
        this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.02);
      } else {
        this.masterGain.gain.setValueAtTime(target, this.ctx.currentTime);
      }
    }
    if (muted) {
      if (this.isHumming) {
        this.wasHummingBeforeMute = true;
        this.stopTransformerHum();
      }
    } else {
      if (this.wasHummingBeforeMute) {
        this.startTransformerHum(this.humVolume);
        this.wasHummingBeforeMute = false;
      }
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getIsHumming(): boolean {
    return this.isHumming;
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
      gain.connect(this.getDestination());

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Audio context might be restricted before interaction
    }
  }

  public playKeyClick() {
    this.playClick(1050);
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
      gain.connect(this.getDestination());

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
      gain.connect(this.getDestination());

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }

  // Continuous background 50Hz mains hum
  public startTransformerHum(volume = 0.04) {
    this.humVolume = volume;
    if (this.isMuted || this.isHumming) return;
    try {
      const ctx = this.getContext();
      this.humGain = ctx.createGain();
      this.humGain.gain.setValueAtTime(0.0001, ctx.currentTime);
      if (typeof this.humGain.gain.exponentialRampToValueAtTime === 'function') {
        this.humGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), ctx.currentTime + 0.15);
      } else {
        this.humGain.gain.setValueAtTime(volume, ctx.currentTime);
      }

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
      this.humGain.connect(this.getDestination());

      this.humOsc1.start();
      this.humOsc2.start();
      this.isHumming = true;
    } catch {}
  }

  public stopTransformerHum() {
    try {
      const osc1 = this.humOsc1;
      const osc2 = this.humOsc2;
      const gain = this.humGain;
      this.humOsc1 = null;
      this.humOsc2 = null;
      this.humGain = null;
      this.isHumming = false;

      if (gain && this.ctx) {
        if (typeof gain.gain.setTargetAtTime === 'function') {
          gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.03);
        } else {
          gain.gain.setValueAtTime(0, this.ctx.currentTime);
        }
        setTimeout(() => {
          try {
            osc1?.stop();
            osc1?.disconnect();
            osc2?.stop();
            osc2?.disconnect();
            gain.disconnect();
          } catch {}
        }, 60);
      } else {
        osc1?.stop();
        osc1?.disconnect();
        osc2?.stop();
        osc2?.disconnect();
      }
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
        gain.connect(this.getDestination());

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
      gain.connect(this.getDestination());

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
      gain.connect(this.getDestination());

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
      gain.connect(this.getDestination());

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
      disGain.connect(this.getDestination());

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
      gain.connect(this.getDestination());

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
        gain.connect(this.getDestination());

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
      gain.connect(this.getDestination());

      lfo.start();
      osc.start();
      lfo.stop(ctx.currentTime + duration);
      osc.stop(ctx.currentTime + duration);

      this.playStatic(duration, 0.02);
    } catch {}
  }

  // Electrical Arc / Circuit Breaker Trip
  public playBreakerTrip() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const dest = this.getDestination();
      const now = ctx.currentTime;

      // High transient snap (electrical arc)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(2600, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.12);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 0.12);

      // Low mechanical thud
      const thud = ctx.createOscillator();
      const thudGain = ctx.createGain();
      thud.type = 'triangle';
      thud.frequency.setValueAtTime(140, now);
      thud.frequency.exponentialRampToValueAtTime(28, now + 0.35);
      thudGain.gain.setValueAtTime(0.4, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      thud.connect(thudGain);
      thudGain.connect(dest);
      thud.start(now);
      thud.stop(now + 0.35);

      this.playStatic(0.2, 0.12);
    } catch {}
  }

  // Pressurized Liquid Nitrogen Cryo Hiss & Ice Crackle
  public playCryoHiss(duration = 2.2) {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const dest = this.getDestination();
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        const crackle = Math.random() > 0.985 ? (Math.random() * 2 - 1) * 1.8 : 0;
        data[i] = ((Math.random() * 2 - 1) * 0.7 + crackle) * Math.sin((i / bufferSize) * Math.PI);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1400, ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(3600, ctx.currentTime + duration * 0.7);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.16, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      noise.start();
    } catch {}
  }

  // Authentic Soviet PBX Telephone Ring (425 Hz)
  public playTelephoneRing() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const dest = this.getDestination();
      const now = ctx.currentTime;
      [0, 0.45].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(425, now + offset);
        gain.gain.setValueAtTime(0.12, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.35);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now + offset);
        osc.stop(now + offset + 0.36);
      });
    } catch {}
  }

  // Rotary Mechanical Dial Clicks
  public playRotaryDial() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const dest = this.getDestination();
      const clicks = 6;
      for (let i = 0; i < clicks; i++) {
        const t = ctx.currentTime + i * 0.055;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(750 + i * 60, t);
        gain.gain.setValueAtTime(0.045, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(t);
        osc.stop(t + 0.025);
      }
    } catch {}
  }

  // Morse Code / Numbers Station Audio Synthesis
  public playMorseCode(pattern = '... --- ...') {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const dest = this.getDestination();
      let t = ctx.currentTime;
      for (const char of pattern) {
        if (char === '.' || char === '-') {
          const dur = char === '.' ? 0.06 : 0.18;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(780, t);
          gain.gain.setValueAtTime(0.07, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
          osc.connect(gain);
          gain.connect(dest);
          osc.start(t);
          osc.stop(t + dur);
          t += dur + 0.05;
        } else if (char === ' ') {
          t += 0.12;
        }
      }
    } catch {}
  }

  // Heavy Soviet industrial toggle switch clack
  public playHeavyToggle(isOn: boolean = true) {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const dest = this.getDestination();
      const t = ctx.currentTime;

      // Primary metallic snap
      const snap = ctx.createOscillator();
      const snapGain = ctx.createGain();
      snap.type = 'sawtooth';
      snap.frequency.setValueAtTime(isOn ? 1400 : 950, t);
      snap.frequency.exponentialRampToValueAtTime(180, t + 0.03);

      snapGain.gain.setValueAtTime(0.12, t);
      snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

      snap.connect(snapGain);
      snapGain.connect(dest);
      snap.start(t);
      snap.stop(t + 0.04);

      // Deep chassis latch thud
      const thud = ctx.createOscillator();
      const thudGain = ctx.createGain();
      thud.type = 'triangle';
      thud.frequency.setValueAtTime(isOn ? 180 : 130, t + 0.01);
      thud.frequency.exponentialRampToValueAtTime(45, t + 0.08);

      thudGain.gain.setValueAtTime(0.18, t + 0.01);
      thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      thud.connect(thudGain);
      thudGain.connect(dest);
      thud.start(t + 0.01);
      thud.stop(t + 0.1);
    } catch {}
  }

  // Authentic CCITT Dual-Tone Multi-Frequency (DTMF) telephone dialing tones
  public playPhoneTone(digit: string, duration = 0.14) {
    if (this.isMuted) return;
    try {
      const dtmfFreqs: Record<string, [number, number]> = {
        '1': [697, 1209],
        '2': [697, 1336],
        '3': [697, 1477],
        '4': [770, 1209],
        '5': [770, 1336],
        '6': [770, 1477],
        '7': [852, 1209],
        '8': [852, 1336],
        '9': [852, 1477],
        '*': [941, 1209],
        '0': [941, 1336],
        '#': [941, 1477],
      };

      const freqs = dtmfFreqs[digit] || [770, 1336];
      const ctx = this.getContext();
      const dest = this.getDestination();
      const t = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(freqs[0], t);
      osc2.frequency.setValueAtTime(freqs[1], t);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(dest);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + duration);
      osc2.stop(t + duration);
    } catch {}
  }

  // Soft tactile document / paper rustle
  public playPaperRustle() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const dest = this.getDestination();
      const t = ctx.currentTime;
      const duration = 0.15;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2200, t);
      filter.Q.setValueAtTime(0.8, t);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      noise.start(t);
    } catch {}
  }

  // Heavy rubber stamp thump onto municipal document
  public playStampThump() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const dest = this.getDestination();
      const t = ctx.currentTime;

      // Heavy body impact
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(90, t);
      osc.frequency.exponentialRampToValueAtTime(25, t + 0.12);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(t);
      osc.stop(t + 0.15);

      // Ink slap texture
      this.playStatic(0.04, 0.03);
    } catch {}
  }

  // Tactile friction scratch when unredacting classified document sections
  public playMarkerScratch() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const dest = this.getDestination();
      const t = ctx.currentTime;
      const duration = 0.12;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3200, t);
      filter.frequency.linearRampToValueAtTime(1400, t + duration);
      filter.Q.setValueAtTime(1.8, t);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      noise.start(t);
    } catch {}
  }

  // Synthetic voice message playback (muffled human vocal resonance with pitch wobble)
  public playVoiceMessageSound(duration = 2.5) {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const dest = this.getDestination();
      const t = ctx.currentTime;

      // Vocal formant oscillator
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, t);

      // Pitch wobble / unsettled breathing frequency
      osc.frequency.linearRampToValueAtTime(165, t + duration * 0.3);
      osc.frequency.linearRampToValueAtTime(125, t + duration * 0.7);
      osc.frequency.linearRampToValueAtTime(90, t + duration);

      // Bandpass filter to simulate phone/intercom vocal tract
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(750, t);
      filter.Q.setValueAtTime(4.0, t);

      gain.gain.setValueAtTime(0.06, t);
      gain.gain.linearRampToValueAtTime(0.09, t + duration * 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc.start(t);
      osc.stop(t + duration);
    } catch {}
  }

  // Geiger Counter Electrostatic Anomaly Clicks
  public playGeigerCounter(clicks = 4) {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const dest = this.getDestination();
      for (let i = 0; i < clicks; i++) {
        const t = ctx.currentTime + Math.random() * 0.16;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(2600 + Math.random() * 900, t);
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.012);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(t);
        osc.stop(t + 0.012);
      }
    } catch {}
  }

  // Mobile Haptic Vibration for tactile game feedback (Citycode/Quest UX)
  public triggerHaptic(type: 'tap' | 'success' | 'error' | 'warning' | 'screamer' = 'tap') {
    if (typeof window === 'undefined' || typeof navigator === 'undefined' || !navigator.vibrate) {
      return;
    }
    try {
      switch (type) {
        case 'tap':
          navigator.vibrate(25);
          break;
        case 'success':
          navigator.vibrate([40, 60, 80]);
          break;
        case 'error':
          navigator.vibrate([100, 50, 100]);
          break;
        case 'warning':
          navigator.vibrate([30, 40, 30, 40, 80]);
          break;
        case 'screamer':
          navigator.vibrate([200, 80, 250, 50, 300]);
          break;
      }
    } catch {}
  }
}

export const sound = new SoundEngine();
