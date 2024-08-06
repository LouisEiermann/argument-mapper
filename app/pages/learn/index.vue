<template>
  <UCard v-for="topic of topics" class="m-4">
    <NuxtLink :to="'learn/' + topic.title">{{ topic.title }}</NuxtLink>
    <template #footer>
      <UProgress :value="0" indicator />
    </template>
  </UCard>
</template>
<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

const topics = useAsyncData(() => getMany("topics", 2)).data;
const progress = useAsyncData(() =>
  get("users/progress", data.value.userId),
).data;
</script>
