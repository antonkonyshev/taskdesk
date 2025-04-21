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

let lastScrollPosition = 0
let navbarHidden = false
const navbar = document.getElementById("navigation-header")
window.addEventListener('scroll', () => {
    if (window.scrollY < lastScrollPosition) {
        if (navbarHidden) {
            navbar.style.transform = "translateY(0)"
            navbarHidden = false
        }
    } else {
        if (!navbarHidden) {
            navbar.style.transform = "translateY(-100%)"
            navbarHidden = true
        }
    }
    lastScrollPosition = window.scrollY
})