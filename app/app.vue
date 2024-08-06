<template>
  <main>
    <NuxtLayout name="default">
      <UNotifications />
      <NuxtPage />
      <CookieControl :locale="locale" />
    </NuxtLayout>
  </main>
</template>
<script setup lang="ts">
const { locale } = useI18n();
</script>
