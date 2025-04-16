import { createApp } from "vue/dist/vue.esm-bundler"

createApp({
    data() {
        return {
            showNavigationMenu: false
        }
    }
}).mount("#navigation-app")

var lastScrollPosition = 0
var navbarHidden = false
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