<template>
  <div class="container">
    <UProgress :value="70" />
    <Tree :node="data" v-if="data" />
  </div>
</template>
<script setup lang="ts">
const { find } = useStrapi();

const response = await find("argument-trees", { populate: "nodes" });

const { data, refresh } = await useAsyncData("data", () =>
  $fetch(
    `http://localhost:1337/api/node-tree?id=${response.data[0].attributes.nodes.data[0].id}`,
  ),
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
