<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const emit = defineEmits(['hide', 'bookmark'])
</script>

<template>
    <ul class="flex flex-row justify-end items-center text-center xs:gap-3 xs:px-3 sm:gap-5 sm:px-5 md:gap-6 md:px-6 border-l-gray-300 border-l" role="menu">
        <li role="menuitem">
            <a href="" @click.stop.prevent="emit('bookmark', $event)"
                class="navigation-button flex !flex-col !px-4">

                <span class="navigation-icon !mx-0 svg-bookmark"></span>
                <span class="text-sm" v-text="t('message.mark')"></span>
            </a>
        </li>

        <li role="menuitem">
            <a href="" @click.stop.prevent="emit('hide', $event)"
                class="navigation-button flex !flex-col !px-4">

                <span class="navigation-icon !mx-0 svg-eye-slash"></span>
                <span class="text-sm" v-text="t('message.hide')"></span>
            </a>
        </li>
    </ul>
</template>