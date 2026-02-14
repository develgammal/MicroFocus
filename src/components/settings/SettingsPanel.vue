<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/stores/settings.store'
import { useHistoryStore } from '@/stores/history.store'
import { useSpeech } from '@/composables/useSpeech'
import { useAudioSynth } from '@/composables/useAudioSynth'
import { SoundscapeKey } from '@/interfaces'
import type { ISelectOption } from '@/interfaces'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'

const { t } = useI18n()
const settingsStore = useSettingsStore()
const historyStore = useHistoryStore()
const { availableVoices } = useSpeech()
const { playSound } = useAudioSynth()

defineEmits<{
  settingsChanged: []
}>()

const soundOptions = computed<ISelectOption[]>(() => [
  { value: SoundscapeKey.Gong, label: t('sounds.gong') },
  { value: SoundscapeKey.Forest, label: t('sounds.forest') },
  { value: SoundscapeKey.Ocean, label: t('sounds.ocean') },
  { value: SoundscapeKey.Om, label: t('sounds.om') },
  { value: SoundscapeKey.Bell, label: t('sounds.bell') },
  { value: SoundscapeKey.Retro, label: t('sounds.retro') },
  { value: SoundscapeKey.Digital, label: t('sounds.digital') },
  { value: SoundscapeKey.Mute, label: t('sounds.mute') },
])

const voiceOptions = computed<ISelectOption[]>(() => [
  { value: '', label: t('common.defaultVoice') },
  ...availableVoices.value.map((v) => ({
    value: v.voiceURI,
    label: v.displayName,
  })),
])

function handleIntervalChange(value: string | number): void {
  settingsStore.updateInterval(Number(value))
}

function handleMaxRepetitionChange(value: string | number): void {
  settingsStore.updateMaxRepetition(Number(value))
}

function handleSoundRepeatChange(value: string | number): void {
  settingsStore.updateSoundRepeat(Number(value))
}

function handleSoundChange(value: string): void {
  settingsStore.soundPreference = value as SoundscapeKey
  if (value !== SoundscapeKey.Mute) {
    playSound(value as SoundscapeKey)
  }
}

function handleClearHistory(): void {
  if (window.confirm(t('settings.clearHistoryConfirm'))) {
    historyStore.clearHistory()
    settingsStore.persistAll()
  }
}
</script>

<template>
  <div class="bg-background rounded-lg p-4 mb-6 border border-border transition-colors">
    <h3 class="text-subheading text-text-muted mb-3">
      {{ t('settings.title') }}
    </h3>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <BaseInput
        :model-value="settingsStore.intervalMinutes"
        type="number"
        :label="t('settings.focusInterval')"
        id="interval-input"
        :min="0.1"
        step="any"
        @update:model-value="handleIntervalChange"
      />

      <BaseInput
        :model-value="settingsStore.maxRepetitionSeconds"
        type="number"
        :label="t('settings.maxAlarm')"
        id="max-repetition-input"
        :min="5"
        :max="300"
        @update:model-value="handleMaxRepetitionChange"
      />

      <BaseSelect
        :model-value="settingsStore.soundPreference"
        :options="soundOptions"
        :label="t('settings.soundscape')"
        id="sound-select"
        @update:model-value="handleSoundChange"
      />

      <BaseInput
        :model-value="settingsStore.soundRepeatSeconds"
        type="number"
        :label="t('settings.loopSilence')"
        id="sound-repeat-input"
        :min="2"
        :max="60"
        @update:model-value="handleSoundRepeatChange"
      />
    </div>

    <!-- Quote & Voice -->
    <div class="border-t border-border pt-4 mb-4">
      <BaseInput
        :model-value="settingsStore.quote"
        type="text"
        :label="t('settings.quote')"
        id="quote-input"
        :placeholder="t('settings.quotePlaceholder')"
        @update:model-value="(v: string | number) => (settingsStore.quote = String(v))"
      />

      <div class="mt-3">
        <BaseSelect
          :model-value="settingsStore.voiceURI"
          :options="voiceOptions"
          :label="t('settings.voice')"
          id="voice-select"
          @update:model-value="(v: string) => (settingsStore.voiceURI = v)"
        />
      </div>
    </div>

    <!-- Footer -->
    <div class="pt-2 border-t border-border flex justify-between items-center">
      <span class="text-caption text-text-muted">
        {{ t('settings.storageNote') }}
      </span>
      <button
        class="text-caption font-medium text-danger hover:text-danger-hover transition-colors"
        @click="handleClearHistory"
      >
        {{ t('settings.clearHistory') }}
      </button>
    </div>
  </div>
</template>
