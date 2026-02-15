export enum TimerMode {
  Focus = 'focus',
  Break = 'break',
}

export enum SoundscapeKey {
  Gong = 'gong',
  Forest = 'forest',
  Ocean = 'ocean',
  Om = 'om',
  Bell = 'bell',
  Retro = 'retro',
  Digital = 'digital',
  Mute = 'mute',
}

export interface IFocusSession {
  readonly id: number
  readonly type: 'focus'
  readonly score: number
  readonly timestamp: string
  readonly duration: number
}

export interface IBreakSession {
  readonly id: number
  readonly type: 'break'
  readonly score: 0
  readonly timestamp: string
  readonly duration: number
}

export type ISessionEntry = IFocusSession | IBreakSession

export interface IDailyAverage {
  readonly date: string // YYYY-MM-DD format
  readonly avgScore: number
  readonly sessionCount: number
}

export interface ITimerSettings {
  intervalMinutes: number
  soundRepeatSeconds: number
  maxRepetitionSeconds: number
}

export interface ISoundSettings {
  soundPreference: SoundscapeKey
  quote: string
  voiceURI: string
}

export interface IAppSettings extends ITimerSettings, ISoundSettings {
  darkMode: boolean
}

export interface ITimerState {
  timeLeft: number
  breakElapsed: number
  isRunning: boolean
  mode: TimerMode
}

export interface IAlarmState {
  isAlarming: boolean
  nextAction: 'sound' | 'quote'
  maxDurationReached: boolean
}

export interface IPersistedState {
  history: ISessionEntry[]
  dailyAverages: IDailyAverage[]
  settings: IAppSettings
}

export interface ISelectOption {
  readonly value: string
  readonly label: string
}

export interface IVoiceOption {
  readonly voiceURI: string
  readonly name: string
  readonly lang: string
  readonly displayName: string
}

export type TimerWorkerCommand = 'start' | 'stop'
export type TimerWorkerMessage = 'tick'

export interface IChartDataPoint {
  readonly label: string
  readonly value: number
}

// --- Cognitive Fatigue Detection ---

export enum CognitiveState {
  SteepCrash = 'steep-crash',
  Exhaustion = 'exhaustion',
  Stagnation = 'stagnation',
  WarmUp = 'warm-up',
  Flow = 'flow',
  Continue = 'continue',
  InsufficientData = 'insufficient-data',
  InsufficientBreak = 'insufficient-break',
}

export interface IBreakSuggestion {
  readonly state: CognitiveState
  readonly slopePerSession: number
  readonly percentDecline: number
  readonly windowMinutes: number
  readonly currentScore: number
  readonly recommendedBreakMinutes: number | null
}

export interface IReboundResult {
  readonly percentChange: number
  readonly preBreakScore: number
  readonly postBreakScore: number
  readonly breakDurationMinutes: number
}
