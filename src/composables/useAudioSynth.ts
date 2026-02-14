import { ref } from 'vue'
import { SoundscapeKey } from '@/interfaces'

/**
 * Composable encapsulating all Web Audio API sound synthesis.
 * Each soundscape is procedurally generated — zero external audio files.
 */
export function useAudioSynth() {
  const audioCtx = ref<AudioContext | null>(null)

  function ensureContext(): AudioContext {
    if (!audioCtx.value) {
      audioCtx.value = new AudioContext()
    }
    if (audioCtx.value.state === 'suspended') {
      void audioCtx.value.resume()
    }
    return audioCtx.value
  }

  function playSound(key: SoundscapeKey): void {
    if (key === SoundscapeKey.Mute) return

    const generators: Record<string, () => void> = {
      [SoundscapeKey.Gong]: playGong,
      [SoundscapeKey.Forest]: playForest,
      [SoundscapeKey.Ocean]: playOcean,
      [SoundscapeKey.Om]: playDeepOm,
      [SoundscapeKey.Bell]: playZenBell,
      [SoundscapeKey.Retro]: playRetro,
      [SoundscapeKey.Digital]: playDigitalBeep,
    }

    const generator = generators[key]
    if (generator) generator()
  }

  function playGong(): void {
    const ctx = ensureContext()
    const t = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.setValueAtTime(180, t)

    const fmOsc = ctx.createOscillator()
    const fmGain = ctx.createGain()
    fmOsc.connect(fmGain)
    fmGain.connect(osc.frequency)
    fmOsc.frequency.value = 250
    fmGain.gain.setValueAtTime(300, t)
    fmGain.gain.exponentialRampToValueAtTime(0.1, t + 4)

    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.6, t + 0.1)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 6)

    osc.start(t)
    fmOsc.start(t)
    osc.stop(t + 6)
    fmOsc.stop(t + 6)
  }

  function playForest(): void {
    const ctx = ensureContext()
    const t = ctx.currentTime

    // Pink noise for rustling leaves
    const bufferSize = ctx.sampleRate * 2
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let b0 = 0,
      b1 = 0,
      b2 = 0,
      b3 = 0,
      b4 = 0,
      b5 = 0,
      b6 = 0

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      b0 = 0.99886 * b0 + white * 0.0555179
      b1 = 0.99332 * b1 + white * 0.0750759
      b2 = 0.969 * b2 + white * 0.153852
      b3 = 0.8665 * b3 + white * 0.3104856
      b4 = 0.55 * b4 + white * 0.5329522
      b5 = -0.7616 * b5 - white * 0.016898
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
      b6 = white * 0.115926
    }

    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = 800
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.05, t + 1)
    gain.gain.linearRampToValueAtTime(0, t + 2)
    noise.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    noise.start(t)

    // Bird chirps
    const makeChirp = (delay: number, freq: number, type: OscillatorType = 'sine') => {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = type
      osc.connect(g)
      g.connect(ctx.destination)
      osc.frequency.setValueAtTime(freq, t + delay)
      osc.frequency.linearRampToValueAtTime(freq + 400, t + delay + 0.1)
      g.gain.setValueAtTime(0, t + delay)
      g.gain.linearRampToValueAtTime(0.1, t + delay + 0.05)
      g.gain.linearRampToValueAtTime(0, t + delay + 0.12)
      osc.start(t + delay)
      osc.stop(t + delay + 0.15)
    }

    makeChirp(0.1, 1500)
    makeChirp(0.25, 1800)
    makeChirp(1.5, 1400, 'triangle')
  }

  function playOcean(): void {
    const ctx = ensureContext()
    const t = ctx.currentTime
    const bufferSize = ctx.sampleRate * 4
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1

    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(200, t)
    filter.frequency.linearRampToValueAtTime(1200, t + 2)
    filter.frequency.linearRampToValueAtTime(200, t + 4)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.5, t + 2)
    gain.gain.linearRampToValueAtTime(0, t + 4)
    noise.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    noise.start(t)
  }

  function playZenBell(): void {
    const ctx = ensureContext()
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.setValueAtTime(523.25, t)
    osc.frequency.exponentialRampToValueAtTime(520, t + 2.5)
    gain.gain.setValueAtTime(0.5, t)
    gain.gain.exponentialRampToValueAtTime(0.01, t + 2.5)
    osc.start(t)
    osc.stop(t + 2.5)
  }

  function playDeepOm(): void {
    const ctx = ensureContext()
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(110, t)
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.5, t + 0.5)
    gain.gain.exponentialRampToValueAtTime(0.01, t + 3.0)
    osc.start(t)
    osc.stop(t + 3.0)
  }

  function playRetro(): void {
    const ctx = ensureContext()
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'square'
    osc.frequency.setValueAtTime(880, t)
    osc.frequency.linearRampToValueAtTime(440, t + 0.3)
    gain.gain.setValueAtTime(0.1, t)
    gain.gain.linearRampToValueAtTime(0, t + 0.3)
    osc.start(t)
    osc.stop(t + 0.3)
  }

  function playDigitalBeep(): void {
    const ctx = ensureContext()
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'square'
    osc.frequency.setValueAtTime(800, t)
    gain.gain.setValueAtTime(0.1, t)
    osc.start(t)
    osc.stop(t + 0.15)
  }

  return {
    playSound,
    ensureContext,
  }
}
