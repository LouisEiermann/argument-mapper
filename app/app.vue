<template>
  <main>
    <UApp>
      <NuxtLayout name="default">
        <NuxtPage />
        <CookieControl :locale="locale" />
      </NuxtLayout>
    </UApp>
  </main>
</template>
<script setup lang="ts">
const { locale } = useI18n();
</script>
