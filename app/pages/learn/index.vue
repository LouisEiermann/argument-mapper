<template>
  <UCard v-for="topic of data?.topics?.data" class="m-4">
    <ULink :to="'learn/' + topic.id">{{ topic.attributes.name }}</ULink>
    <template #footer>
      <UProgress :value="0" indicator />
    </template>
  </UCard>
</template>
<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

const { find } = useStrapi();

const { data } = useAsyncData("data", async () => {
  const topics = await find("topics");

  return {
    topics,
  };
});
</script>
