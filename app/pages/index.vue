<template>
  <div class="container">
    <ClientOnly>
      <UButton
        :icon="
          isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'
        "
        color="gray"
        variant="ghost"
        aria-label="Theme"
        @click="isDark = !isDark"
      />
      <template #fallback>
        <div class="w-8 h-8" />
      </template>
    </ClientOnly>
    <h1>Argument Mapper App</h1>
    <UProgress :value="70" />
    <Tree :node="data" v-if="data" />
  </div>
</template>
<script setup lang="ts">
const { find } = useStrapi();
const colorMode = useColorMode();
const isDark = computed({
  get() {
    return colorMode.value === "dark";
  },
  set() {
    colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
  },
});

const response = await find("argument-trees", { populate: "nodes" });

const { data, pending, error, refresh } = await useAsyncData("", () =>
  $fetch(`http://localhost:1337/api/node-tree?id=${response.data[0].id}`),
);

provide("refresh", refresh);
</script>
<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;

  h1 {
    text-align: center;
  }
}
</style>
