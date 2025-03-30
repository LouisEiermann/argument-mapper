<template>
  <div class="container mx-auto px-4 py-8">
    <UTabs :items="items" :default-index="0" @change="onChange" class="mb-8" />
    <h1 class="text-4xl font-bold mb-8">Startseite</h1>

    <div id="Referenzen" class="mt-16">
      <h2 class="text-3xl font-semibold mb-6">Referenzen</h2>
      <!-- Add your references content here -->
    </div>

    <div id="Das Team" class="mt-16">
      <h2 class="text-3xl font-semibold mb-6">Das Team</h2>
      <!-- Add your team content here -->
    </div>

    <div id="Kontakt" class="mt-16">
      <h2 class="text-3xl font-semibold mb-6">Kontakt</h2>
      <!-- Add your contact content here -->
    </div>
  </div>
</template>
<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";

definePageMeta({
  middleware: "redirect",
});

const items = ref<TabsItem[]>([
  {
    label: "Referenzen",
  },
  {
    label: "Das Team",
  },
  {
    label: "Kontakt",
  },
]);

const { scrollToAnchor } = useAnchorScroll({
  toTop: {
    scrollOptions: {
      behavior: "smooth",
      offsetTop: 0,
    },
  },
});

const onChange = (index: number) => {
  const item = items.value[index];
  if (item?.label) {
    scrollToAnchor(item.label);
  }
};
</script>
