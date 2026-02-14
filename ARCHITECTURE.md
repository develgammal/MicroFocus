# MicroFocus Architecture

> Auto-generated architecture documentation. Update this file whenever a module or flow changes.

## Component Tree

```mermaid
graph TD
    App["App.vue"]
    RV["RouterView"]
    HV["HomeView"]
    AH["AppHeader"]
    AF["AppFooter"]
    SP["SettingsPanel"]
    TD["TimerDisplay"]
    TC["TimerControls"]
    RO["RatingOverlay"]
    PC["ProductivityChart"]
    BC["BaseCard"]
    TT["ThemeToggle"]
    IB["IconButton"]
    BB["BaseButton"]
    BI["BaseInput"]
    BS["BaseSelect"]
    SB["ScoreButton"]

    App --> RV
    RV --> HV
    HV --> BC
    BC --> AH
    BC --> SP
    BC --> TD
    BC --> TC
    BC --> RO
    BC --> PC
    HV --> AF

    AH --> TT
    AH --> IB

    SP --> BI
    SP --> BS

    TC --> BB
    RO --> SB
    RO --> BB
```

## Store Data Flow

```mermaid
flowchart LR
    subgraph Components
        HV[HomeView]
        SP[SettingsPanel]
        TD[TimerDisplay]
        AF[AppFooter]
        PC[ProductivityChart]
    end

    subgraph Stores
        SS[SettingsStore]
        TS[TimerStore]
        HS[HistoryStore]
    end

    subgraph Persistence
        LS[(localStorage)]
    end

    HV -->|reads/writes| TS
    HV -->|reads/writes| HS
    HV -->|reads| SS
    SP -->|reads/writes| SS
    SP -->|reads/writes| HS
    TD -->|reads| TS
    AF -->|reads| HS
    PC -->|reads| HS

    SS -->|auto-persist| LS
    LS -->|loadSettings| SS
    LS -->|migrate legacy| HS
```

## Timer Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Idle: App loaded
    Idle --> Running: Start Focus
    Running --> Paused: Pause
    Paused --> Running: Resume Focus
    Running --> Completed: timeLeft ≤ 0

    Completed --> Rating: Show overlay + Play alarm
    Rating --> Idle: Score selected (1-10)
    Rating --> BreakRunning: Take a Break

    BreakRunning --> Idle: End Break
    Idle --> Running: Auto-start next session

    note right of Completed
        Alarm loop plays sound/TTS
        until max duration cutoff
    end note
```

## Alarm Loop Sequence

```mermaid
sequenceDiagram
    participant HV as HomeView
    participant AL as useAlarmLoop
    participant AS as useAudioSynth
    participant SP as useSpeech

    HV->>AL: startAlarmLoop(config)
    AL->>AL: Set max duration timeout

    loop Until maxDurationReached
        AL->>AS: playSound(soundscapeKey)
        AL->>AL: Wait silenceSeconds
        alt Quote exists
            AL->>SP: speak(quote, voiceURI)
            SP-->>AL: onEnd callback
            AL->>AL: Wait silenceSeconds
        end
    end

    Note over AL: maxDurationTimeout fires
    AL->>SP: cancelSpeech()
    AL-->>HV: Alarm stopped
```

## Module Dependencies

```mermaid
graph TB
    subgraph Entry
        main["main.ts"]
    end

    subgraph Plugins
        pinia["Pinia"]
        router["Vue Router"]
        i18n["vue-i18n"]
    end

    subgraph Composables
        cTheme["useTheme"]
        cWorker["useTimerWorker"]
        cAudio["useAudioSynth"]
        cSpeech["useSpeech"]
        cAlarm["useAlarmLoop"]
    end

    subgraph Stores
        sSettings["settings.store"]
        sTimer["timer.store"]
        sHistory["history.store"]
    end

    subgraph Utils
        uTime["time.util"]
        uStorage["storage.util"]
        uA11y["accessibility.util"]
    end

    subgraph Worker
        wTimer["timer.worker.ts"]
    end

    main --> pinia
    main --> router
    main --> i18n

    cAlarm --> cAudio
    cAlarm --> cSpeech
    cWorker --> wTimer

    sSettings --> uStorage
    sSettings --> sHistory
    sHistory --> uTime
    sTimer --> uTime
```

## Design System Tokens

```mermaid
graph LR
    subgraph Light Mode
        LP[Primary: #4f46e5]
        LS[Secondary: #059669]
        LA[Accent: #f59e0b]
        LBG[Background: #f8fafc]
        LSF[Surface: #ffffff]
    end

    subgraph Dark Mode
        DP[Primary: #818cf8]
        DS[Secondary: #34d399]
        DA[Accent: #fbbf24]
        DBG[Background: #0f172a]
        DSF[Surface: #1e293b]
    end

    LP -.->|.dark class| DP
    LS -.->|.dark class| DS
    LA -.->|.dark class| DA
    LBG -.->|.dark class| DBG
    LSF -.->|.dark class| DSF
```
