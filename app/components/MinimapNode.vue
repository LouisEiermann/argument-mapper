<template>
  <div v-if="node" class="flex flex-col m-2.5">
    <UCard
      :class="{
        'text-yellow-300':
          currentLevel === node.id || (node.thesis && currentLevel === null),
        'bg-red-500': node?.owner.id !== node?.parent?.owner.id && node.parent,
        'bg-green-500 text-white cursor-pointer relative': true,
      }"
      @click="navigate(node.id)"
    >
      <span>{{ node.title }}</span>
      <UAvatar
        v-if="node.owner.avatar?.url"
        :src="useStrapi().resolveMedia(node.owner.avatar?.url)"
        class="absolute -top-4 right-4"
      />
      <UAvatar
        v-else
        :alt="node.owner.username"
        class="absolute -top-4 right-4"
      />
    </UCard>
    <div
      v-if="node.children && node.children.length > 0"
      class="flex justify-center mt-2.5 pt-2.5 w-full"
    >
      <MinimapNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  node: {
    type: Object,
    required: true,
  },
});
const route = useRoute();
const currentLevel = computed(() => Number(route.query.level) || null);

const navigate = async (id: string) => {
  navigateTo({
    path: "",
    query: {
      level: id,
    },
  });
};
</script>
