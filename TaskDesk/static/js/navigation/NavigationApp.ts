import { createApp, ref, watch } from "vue/dist/vue.esm-bundler"
import { useLocalStorage } from "@vueuse/core"
import { darkThemeInit, applyThemeVariant } from "./theme"

export const navigationApp = createApp({
    setup: () => {
        const showNavigationMenu = ref()
        const darkTheme = useLocalStorage('dark-theme', darkThemeInit())

        applyThemeVariant(darkTheme.value)
        watch(darkTheme, applyThemeVariant)

        return { showNavigationMenu, darkTheme }
    },
})
navigationApp.mount("#navigation-app")