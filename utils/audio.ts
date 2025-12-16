
// Utility to handle raw PCM audio from Gemini API

export interface AudioController {
  stop: () => void;
  completed: Promise<void>;
}

export class DroneSynthesizer {
    private oscillators: OscillatorNode[] = [];
    private gainNodes: GainNode[] = [];
    private masterGain: GainNode | null = null;
    private filter: BiquadFilterNode | null = null;
    private isPlaying: boolean = false;

    constructor() {}

    public start() {
        if (this.isPlaying) return;
        
        const ctx = PcmAudioPlayer.getSharedContext();
        if (!ctx) return;
        
        if (ctx.state === 'suspended') ctx.resume();

        this.masterGain = ctx.createGain();
        this.masterGain.gain.setValueAtTime(0, ctx.currentTime);
        this.masterGain.connect(ctx.destination);
        
        // Warm Lowpass Filter
        this.filter = ctx.createBiquadFilter();
        this.filter.type = 'lowpass';
        this.filter.frequency.value = 400;
        this.filter.connect(this.masterGain);

        // Frequencies for a C# Drone (Om-like)
        // Root (C#2), Fifth (G#2), Octave (C#3)
        const freqs = [138.59, 207.65, 277.18]; 
        const gains = [0.15, 0.1, 0.05];

        freqs.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = i === 0 ? 'sine' : 'triangle';
            osc.frequency.value = freq;
            
            // Add slight detune for organic feel
            osc.detune.value = Math.random() * 4 - 2;

            gain.gain.value = gains[i];
            
            osc.connect(gain);
            gain.connect(this.filter!);
            
            osc.start();
            this.oscillators.push(osc);
            this.gainNodes.push(gain);
        });

        // Fade in
        this.masterGain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 3);
        this.isPlaying = true;
    }

    public stop() {
        if (!this.isPlaying || !this.masterGain) return;
        
        const ctx = PcmAudioPlayer.getSharedContext();
        if (ctx) {
             // Fade out
            this.masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
            setTimeout(() => {
                this.oscillators.forEach(osc => { try { osc.stop(); osc.disconnect(); } catch(e){} });
                this.gainNodes.forEach(g => g.disconnect());
                this.filter?.disconnect();
                this.masterGain?.disconnect();
                this.oscillators = [];
                this.gainNodes = [];
                this.isPlaying = false;
            }, 1100);
        }
    }
}

export class PcmAudioPlayer {
  private static sharedContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  
  // Data Storage
  private audioChunks: Float32Array[] = [];
  private totalSamples: number = 0;
  private sampleRate: number;
  private cachedFullBuffer: Float32Array | null = null;
  
  // State
  private isPlaying: boolean = false;
  private startTime: number = 0; // Context time when playback started (for getCurrentTime)
  private startOffset: number = 0; // Offset into the buffer where playback started
  private playbackRate: number = 1.0;
  
  // Streaming State
  private isStreaming: boolean = false;
  private realtimeStreaming: boolean = false; // True if we are playing chunks as they arrive
  private nextChunkStartTime: number = 0;
  private gapCorrection: number = 0; // Accumulator for network lags/gaps
  private activeSources: AudioBufferSourceNode[] = [];
  private onEndedCallback: (() => void) | null = null;

  constructor(sampleRate: number = 24000) {
    this.sampleRate = sampleRate;
    this.initContext();
  }

  private initContext() {
    if (!PcmAudioPlayer.sharedContext) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      PcmAudioPlayer.sharedContext = new AudioContextClass({ 
          sampleRate: this.sampleRate,
          latencyHint: 'interactive' 
      });
    }

    this.ensureContext();

    // Create Gain Node for Volume
    if (!this.gainNode && PcmAudioPlayer.sharedContext) {
        this.gainNode = PcmAudioPlayer.sharedContext.createGain();
        this.gainNode.connect(PcmAudioPlayer.sharedContext.destination);
    }

    // Create Analyser
    if (!this.analyser && PcmAudioPlayer.sharedContext && this.gainNode) {
        this.analyser = PcmAudioPlayer.sharedContext.createAnalyser();
        this.analyser.fftSize = 256; 
        this.analyser.smoothingTimeConstant = 0.85;
        this.analyser.connect(this.gainNode);
    }
  }
  
  public static getSharedContext() {
      return PcmAudioPlayer.sharedContext;
  }
  
  public static playBell() {
      const ctx = PcmAudioPlayer.sharedContext;
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      
      const t = ctx.currentTime;
      const fundamental = 432; 

      // 1. Fundamental Tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(fundamental, t);
      
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 0.05); 
      gain.gain.exponentialRampToValueAtTime(0.001, t + 4); 
      
      osc.start(t);
      osc.stop(t + 4);

      // 2. Harmonic (Metallic overtone)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(fundamental * 2.5, t); 
      
      gain2.gain.setValueAtTime(0, t);
      gain2.gain.linearRampToValueAtTime(0.05, t + 0.02); 
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 2); 
      
      osc2.start(t);
      osc2.stop(t + 2);
  }

  public async ensureContext() {
      if (PcmAudioPlayer.sharedContext && PcmAudioPlayer.sharedContext.state === 'suspended') {
          try {
              await PcmAudioPlayer.sharedContext.resume();
          } catch (e) {
              console.warn("Failed to resume audio context", e);
          }
      }
  }

  public setOnEnded(callback: () => void) {
      this.onEndedCallback = callback;
  }
  
  public setPlaybackRate(rate: number) {
      this.playbackRate = rate;
      this.activeSources.forEach(source => {
          try { source.playbackRate.value = rate; } catch(e) {}
      });
  }

  // --- STREAMING METHODS ---

  public startStreaming() {
      this.stop(); 
      this.ensureContext();
      this.isPlaying = true;
      this.isStreaming = true;
      this.realtimeStreaming = true;
      
      if (PcmAudioPlayer.sharedContext) {
          // Sync start time
          this.startTime = PcmAudioPlayer.sharedContext.currentTime;
          this.nextChunkStartTime = this.startTime;
      }
  }

  public finishStreaming() {
      this.isStreaming = false;
      this.checkEnded();
  }

  public scheduleChunk(base64: string) {
      const chunkPcm = this.decodeToFloat32(base64);
      if (chunkPcm.length === 0) return;

      this.audioChunks.push(chunkPcm);
      this.totalSamples += chunkPcm.length;
      this.cachedFullBuffer = null; // Invalidate cache

      // Only play immediately if we are in realtime streaming mode
      if (this.isPlaying && this.realtimeStreaming && PcmAudioPlayer.sharedContext) {
          this.playStreamChunk(chunkPcm);
      }
  }

  private playStreamChunk(pcmData: Float32Array) {
      if (!PcmAudioPlayer.sharedContext) return;

      const buffer = PcmAudioPlayer.sharedContext.createBuffer(1, pcmData.length, this.sampleRate);
      buffer.getChannelData(0).set(pcmData);

      const source = PcmAudioPlayer.sharedContext.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = this.playbackRate;
      
      if (this.analyser) source.connect(this.analyser);
      else if (this.gainNode) source.connect(this.gainNode);

      const now = PcmAudioPlayer.sharedContext.currentTime;
      let startAt = this.nextChunkStartTime;
      
      if (startAt < now) {
          const gap = now - startAt;
          this.gapCorrection += gap;
          startAt = now; 
      }
      
      source.start(startAt);
      this.nextChunkStartTime = startAt + (buffer.duration / this.playbackRate);
      
      this.activeSources.push(source);
      
      source.onended = () => {
          const idx = this.activeSources.indexOf(source);
          if (idx > -1) this.activeSources.splice(idx, 1);
          this.checkEnded();
      };
  }

  private checkEnded() {
      if (this.isStreaming) return;
      if (this.isPlaying && this.activeSources.length === 0) {
          this.isPlaying = false;
          if (this.onEndedCallback) this.onEndedCallback();
      }
  }

  // --- BUFFERED PLAYBACK METHODS ---

  private getFullBuffer(): Float32Array {
      if (this.cachedFullBuffer && this.cachedFullBuffer.length === this.totalSamples) {
          return this.cachedFullBuffer;
      }

      const merged = new Float32Array(this.totalSamples);
      let offset = 0;
      for (const chunk of this.audioChunks) {
          merged.set(chunk, offset);
          offset += chunk.length;
      }
      this.cachedFullBuffer = merged;
      return merged;
  }

  public playFrom(offsetTime: number) {
      // Clear previous sources but keep data
      this.realtimeStreaming = false;
      this.stopSourcesOnly();
      this.ensureContext(); // Critical for mobile playback
      this.isPlaying = true;
      
      if (!PcmAudioPlayer.sharedContext || !this.gainNode) return;
      if (this.totalSamples === 0) {
          this.isPlaying = false;
          return;
      }

      const fullPcmData = this.getFullBuffer();
      // Ensure offset doesn't exceed duration
      const totalDuration = fullPcmData.length / this.sampleRate;
      const safeOffset = Math.min(offsetTime, totalDuration - 0.05);

      if (safeOffset < 0 || safeOffset >= totalDuration) {
          this.isPlaying = false;
          if (this.onEndedCallback) this.onEndedCallback();
          return;
      }

      const buffer = PcmAudioPlayer.sharedContext.createBuffer(1, fullPcmData.length, this.sampleRate);
      buffer.getChannelData(0).set(fullPcmData);

      const source = PcmAudioPlayer.sharedContext.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = this.playbackRate;
      
      if (this.analyser) source.connect(this.analyser);
      else source.connect(this.gainNode);

      this.activeSources.push(source);
      this.startOffset = safeOffset;
      this.startTime = PcmAudioPlayer.sharedContext.currentTime;

      try {
        source.start(0, safeOffset);
      } catch (e) {
        console.error("Source start error:", e);
        this.isPlaying = false;
        return;
      }
      
      source.onended = () => {
          const idx = this.activeSources.indexOf(source);
          if (idx > -1) this.activeSources.splice(idx, 1);
          this.checkEnded();
      };
  }

  // --- CONTROLS ---

  public setVolume(value: number) {
      if (this.gainNode && PcmAudioPlayer.sharedContext) {
          this.gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, value)), PcmAudioPlayer.sharedContext.currentTime);
      }
  }

  public getDuration(): number {
      if (this.sampleRate === 0) return 0;
      return (this.totalSamples / this.sampleRate); 
  }

  public getCurrentTime(): number {
      if (!this.isPlaying && !this.isPaused()) return this.startOffset;
      if (!PcmAudioPlayer.sharedContext) return 0;
      
      let elapsed;
      if (this.realtimeStreaming) {
          elapsed = (PcmAudioPlayer.sharedContext.currentTime - this.startTime - this.gapCorrection) * this.playbackRate;
      } else {
          elapsed = (PcmAudioPlayer.sharedContext.currentTime - this.startTime) * this.playbackRate;
      }
      
      const totalDur = this.getDuration();
      return Math.min(Math.max(0, this.startOffset + elapsed), totalDur);
  }

  private isPaused() {
      return !this.isPlaying && this.totalSamples > 0;
  }

  public pause() {
      if (PcmAudioPlayer.sharedContext && this.isPlaying) {
         const time = this.getCurrentTime();
         this.startOffset = time;
      }
      this.realtimeStreaming = false; 
      this.stopSourcesOnly();
      this.isPlaying = false;
  }

  public resume() {
      if (this.isPlaying) return;
      this.playFrom(this.startOffset);
  }

  public stop() {
      this.stopSourcesOnly();
      this.isPlaying = false;
      this.isStreaming = false;
      this.realtimeStreaming = false;
      this.startOffset = 0;
      this.startTime = 0;
      this.nextChunkStartTime = 0;
      this.gapCorrection = 0;
      this.audioChunks = [];
      this.totalSamples = 0;
      this.cachedFullBuffer = null;
  }

  private stopSourcesOnly() {
      this.activeSources.forEach(source => {
          try { source.stop(); } catch(e) {}
          try { source.disconnect(); } catch(e) {}
      });
      this.activeSources = [];
  }

  public getAnalyser(): AnalyserNode | null {
      return this.analyser;
  }

  private decodeToFloat32(base64: string): Float32Array {
    try {
        if (!base64) return new Float32Array(0);
        // Robust cleaning of base64 string
        const cleanBase64 = base64.replace(/\s/g, '');
        const binaryString = window.atob(cleanBase64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const dataInt16 = new Int16Array(bytes.buffer);
        const float32 = new Float32Array(dataInt16.length);
        for (let i = 0; i < dataInt16.length; i++) {
          float32[i] = dataInt16[i] / 32768.0;
        }
        return float32;
    } catch (e) {
        console.error("Audio Decode Error", e);
        return new Float32Array(0);
    }
  }
}

export const playPcmData = (base64: string): AudioController => {
  const player = new PcmAudioPlayer();
  player.scheduleChunk(base64);
  player.finishStreaming();

  let resolveCompleted: () => void;
  const completed = new Promise<void>((resolve) => {
      resolveCompleted = resolve;
  });

  player.setOnEnded(() => {
      resolveCompleted();
  });

  player.playFrom(0);

  return {
      stop: () => {
          player.stop();
          resolveCompleted();
      },
      completed
  };
};
