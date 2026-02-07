<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import InstallAppButton from './InstallAppButton.vue'

defineProps({ showAddTask: {
    type: Boolean, default: true
}})
const toolbarVisible = ref(true)
const lastScrollY = ref<number>(window.scrollY)
const installButtonVisibility = ref<boolean>(false)
const { t } = useI18n()

let ignoreScroll = false
window.addEventListener('scroll', () => {
    if (ignoreScroll || window.scrollY == lastScrollY.value) {
        return
    } else if (window.scrollY - lastScrollY.value > 0) {
        if (toolbarVisible.value) {
            toolbarVisible.value = false
            ignoreScroll = true
            setTimeout(() => ignoreScroll = false, 500)
        }
    } else {
        if (!toolbarVisible.value) {
            toolbarVisible.value = true
            ignoreScroll = true
            setTimeout(() => ignoreScroll = false, 500)
        }
    }
    lastScrollY.value = window.scrollY
})

const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
    <nav class="fixed bottom-0 left-0 w-full flex lg:hidden flex-row justify-between bg-white z-20 shadow-[0_-1px_3px_rgba(0,0,0,0.2)] border-t border-t-gray-300 px-0 py-0 dark:bg-gray-900 dark:shadow-[0_-1px_3px_rgba(0,0,0,0.5)] dark:border-t-black translate-y-0 duration-500"
        :class="{'translate-y-[30vh]': !toolbarVisible}" aria-label="Toolbar">
        <ul class="flex flex-1 flex-row justify-around items-center text-center" role="menu">
            <li role="menuitem" v-if="lastScrollY">
                <a href="" @click.stop.prevent="scrollToTop"
                    class="navigation-button flex !flex-col !px-2 xs:!px-4">
                    <span class="navigation-icon !flex !mx-0 svg-arrow-up-circle"></span>
                    <span class="!flex text-sm" v-text="t('message.to_top')"></span>
                </a>
            </li>

            <li role="menuitem" v-if="installButtonVisibility" class="hidden xs:flex lg:hidden">
                <install-app-button v-model="installButtonVisibility" css-classes="!flex-col !mx-0 text-sm" />
            </li>

            <li role="menuitem" v-if="showAddTask">
                <a href="/tasks/new/" class="navigation-button flex !flex-col !px-2 xs:!px-4">
                    <span class="navigation-icon !mx-0 svg-plus-circle"></span>
                    <span class="text-sm" v-text="t('message.add_task')"></span>
                </a>
            </li>
        </ul>

        <slot />
    </nav>
</template>