<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const visibility = defineModel()
defineProps({ cssClasses: {
    type: String,
    default: '',
}})
const { t } = useI18n()
const appInstalled = ref<any>(window.matchMedia('(display-mode: standalone)').matches || false)
const appInstallPrompt = ref<any>(false)

if (!appInstalled.value) {
    window.addEventListener("beforeinstallprompt", (event) => {
        event.preventDefault()
        appInstallPrompt.value = event;
    })

    window.addEventListener("appinstalled", (event) => (
        'locationStorage' in window ?
        localStorage.setItem("appinstalled", new Date().toISOString()) :
        undefined))
}

const installPWA = () => {
    if (appInstallPrompt.value) {
        appInstallPrompt.value.prompt()
        appInstallPrompt.value = false
    }
}

const isVisible = computed(() => {
    visibility.value = !appInstalled && appInstallPrompt
    return visibility.value
})
</script>

<template>
    <a v-if="isVisible"
        class="navigation-button hidden flex-row items-center"
        @click.stop.prevent="installPWA()" href=""
        :class="[{'!flex': appInstallPrompt}, cssClasses]">

        <span class="navigation-icon svg-wrench" :class="cssClasses"></span>
        <span v-text="t('message.install_app')"></span>
    </a>
</template>