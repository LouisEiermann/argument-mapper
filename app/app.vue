<template>
  <main>
    <UApp :locale="locales[locale]">
      <NuxtLayout name="default">
        <NuxtPage />
        <CookieControl :locale="locale" />
      </NuxtLayout>
    </UApp>
  </main>
</template>
<script setup lang="ts">
import * as locales from "@nuxt/ui/locale";

const { locale } = useI18n();
</script>
