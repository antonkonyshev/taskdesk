import { createApp, ref, watch } from "vue/dist/vue.esm-bundler"
import { useLocalStorage } from "@vueuse/core"
import { darkThemeInit, applyThemeVariant } from "./theme"
import i18n from 'TaskDesk/js/i18n'
import InstallAppButton from "../common/components/InstallAppButton.vue"

export const navigationApp = createApp({
    setup: () => {
        const showNavigationMenu = ref<boolean>(false)
        const darkTheme = useLocalStorage('dark-theme', darkThemeInit())

        applyThemeVariant(darkTheme.value)
        watch(darkTheme, applyThemeVariant)
        
        return { showNavigationMenu, darkTheme }
    },

    components: {
        InstallAppButton,
    },
}).use(i18n)
navigationApp.mount("#navigation-app")