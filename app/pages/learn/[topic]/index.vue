<template>
  <UCard class="w-fit m-4">
    <h1>Lession 1</h1>
    <UProgress :value="0" indicator />
    <UButton
      color="primary"
      label="Start"
      class="mt-4"
      :to="route.path + '/lession1'"
    />
  </UCard>
</template>
<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

const route = useRoute();
</script>
