// Web Audio API Pleasant Luxury Ambient Music Synthesizer & Audio Engine
// Generates soothing, high-end ambient piano, harp, and lounge melodies

export interface MusicTrack {
  id: string;
  title: string;
  composer: string;
  division: 'laundry' | 'boutique' | 'both';
  durationSeconds: number;
  description: string;
  chords: number[][]; // Frequency combinations
}

export const LUXURY_TRACKS: MusicTrack[] = [
  {
    id: 'track_silk_serenade',
    title: 'Silk & Ivory Serenade',
    composer: 'FabriQ AI Sound Studio',
    division: 'laundry',
    durationSeconds: 180,
    description: 'Relaxing 432Hz piano chords with warm velvet resonance & soft ambient pad.',
    chords: [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 349.23], // G7
    ],
  },
  {
    id: 'track_atelier_lounge',
    title: 'Studio Lounge & Cashmere',
    composer: 'FabriQ Boutique Ensemble',
    division: 'boutique',
    durationSeconds: 210,
    description: 'Pleasant lo-fi lounge keys, gentle analog warmth, and soothing fitting room acoustic vibe.',
    chords: [
      [293.66, 349.23, 440.00, 523.25], // Dm7
      [196.00, 246.94, 293.66, 392.00], // G7
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
    ],
  },
  {
    id: 'track_shining_white',
    title: 'Shining White Harmony',
    composer: 'Pure Audio Studio',
    division: 'both',
    durationSeconds: 240,
    description: 'Crisp, radiant ambient harp arpeggios with soothing bass drones & soft chime bells.',
    chords: [
      [329.63, 392.00, 493.88, 587.33], // Em7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [261.63, 329.63, 392.00, 523.25], // C
      [196.00, 246.94, 293.66, 440.00], // G
    ],
  },
];

class MusicEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentTrackIndex: number = 0;
  private masterGain: GainNode | null = null;
  private timerId: number | null = null;
  private activeOscillators: OscillatorNode[] = [];

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.25; // Gentle pleasant volume
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playTrack(index: number = 0) {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    this.stop();
    this.isPlaying = true;
    this.currentTrackIndex = index % LUXURY_TRACKS.length;
    const track = LUXURY_TRACKS[this.currentTrackIndex];

    let chordStep = 0;

    const playChordSequence = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;

      const freqs = track.chords[chordStep % track.chords.length];
      chordStep++;

      const now = this.ctx.currentTime;
      const duration = 3.8; // 3.8 seconds per lush chord

      freqs.forEach((freq, i) => {
        if (!this.ctx || !this.masterGain) return;

        // Soft sine oscillator for gentle piano/harp feel
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        // Subtle harmonics
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        // Soft attack, lingering sustain, gentle release
        const attackTime = 0.4 + i * 0.12; // Arpeggiated stagger effect
        noteGain.gain.setValueAtTime(0.0001, now);
        noteGain.gain.exponentialRampToValueAtTime(0.08 / (i + 1), now + attackTime);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(noteGain);
        noteGain.connect(this.masterGain);

        osc.start(now + i * 0.1);
        osc.stop(now + duration);

        this.activeOscillators.push(osc);
      });

      // Schedule next chord
      this.timerId = window.setTimeout(playChordSequence, 3600);
    };

    playChordSequence();
  }

  public togglePlayPause(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.playTrack(this.currentTrackIndex);
      return true;
    }
  }

  public nextTrack(): MusicTrack {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % LUXURY_TRACKS.length;
    if (this.isPlaying) {
      this.playTrack(this.currentTrackIndex);
    }
    return LUXURY_TRACKS[this.currentTrackIndex];
  }

  public prevTrack(): MusicTrack {
    this.currentTrackIndex = (this.currentTrackIndex - 1 + LUXURY_TRACKS.length) % LUXURY_TRACKS.length;
    if (this.isPlaying) {
      this.playTrack(this.currentTrackIndex);
    }
    return LUXURY_TRACKS[this.currentTrackIndex];
  }

  public setVolume(val: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime);
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch (e) {
        // Ignore
      }
    });
    this.activeOscillators = [];
  }

  public getStatus() {
    return {
      isPlaying: this.isPlaying,
      currentTrack: LUXURY_TRACKS[this.currentTrackIndex],
      currentTrackIndex: this.currentTrackIndex,
    };
  }
}

export const musicEngine = new MusicEngine();
