import { createApp, ref, watch } from "vue/dist/vue.esm-bundler"
import { useLocalStorage } from "@vueuse/core"
import { darkThemeInit, applyThemeVariant } from "./theme"

export const navigationApp = createApp({
    setup: () => {
        const showNavigationMenu = ref()
        const darkTheme = useLocalStorage('dark-theme', darkThemeInit())
        const appInstalled = ref<any>(window.matchMedia('(display-mode: standalone)').matches || false)
        const appInstallPrompt = ref<any>(false)

        applyThemeVariant(darkTheme.value)
        watch(darkTheme, applyThemeVariant)

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

        return { showNavigationMenu, appInstallPrompt, darkTheme, appInstalled, installPWA }
    },
})
navigationApp.mount("#navigation-app")