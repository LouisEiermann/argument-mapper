<template>
  <UCarousel
    v-slot="{ item }"
    :items="sliderItems"
    class="w-full max-w-4xl mx-auto min-w-0"
    :ui="{
      container: 'flex items-start',
      item: 'min-w-0 shrink-0 basis-full',
      prev: 'absolute start-2 top-1/2 -translate-y-1/2 rounded-full',
      next: 'absolute end-2 top-1/2 -translate-y-1/2 rounded-full',
    }"
    arrows
    indicators
  >
    <div class="w-full my-8 px-10">
      <div v-if="item.items" class="flex justify-center items-center gap-8">
        <UCard
          v-for="node of item.items"
          class="relative min-w-[150px] w-[300px] h-[200px] mb-8 !overflow-visible"
          :class="{
            'shadow-[5px_5px_5px_rgb(239,68,68)]': node.soundnessDoubted,
            'opacity-50': isNotValid,
          }"
        >
          <UButton
            v-if="node.owner?.id === ownUser?.id && !node.thesis"
            class="absolute -top-4 right-4"
            icon="i-heroicons-x-circle-20-solid"
            color="error"
            @click="deleteReason(node)"
          />

          <p>{{ node.title }}</p>

          <UButton
            class="absolute top-[11.5rem] left-[8.5rem]"
            icon="i-heroicons-arrow-down-16-solid"
            @click="descendLevel(node.id)"
          />
        </UCard>
      </div>
    </div>
  </UCarousel>
</template>
<script setup lang="ts">
defineProps(["sliderItems", "userIsCreator", "isNotValid"]);

const { deletePremiseGroupForNode } = usePremiseGroupDeletion();
const { fetchUser } = useStrapiAuth();
const ownUser = await fetchUser();

const refresh = inject("refresh");

const deleteReason = async (node: any) => {
  await deletePremiseGroupForNode(node);
  refresh();
};

const descendLevel = async (id: string) => {
  navigateTo({
    path: "",
    query: {
      level: id,
    },
  });
};
</script>
