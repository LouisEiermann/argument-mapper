<template>
  <UCarousel
    v-slot="{ item }"
    :items="sliderItems"
    :ui="{ item: 'basis-full' }"
    arrows
    indicators
  >
    <div class="text-center mx-auto my-8">
      <div v-if="item.items" class="flex justify-center items-center gap-8">
        <UCard
          v-for="node of item.items"
          class="relative min-w-[150px] w-[300px] h-[200px] mb-8"
          :class="{
            'soundness-doubted': node.SoundnessDoubted,
            'not-valid': isNotValid,
          }"
          @click="isSlideroverOpen = true"
        >
          <UButton
            v-if="node.owner?.id === ownUser?.id && !node.Thesis"
            class="absolute -top-4 right-4"
            icon="i-heroicons-x-circle-20-solid"
            color="error"
            @click="deleteReason(node?.id)"
          />

          <p>{{ node.title }}</p>

          <UButton
            class="absolute top-[11.5rem] left-[8.5rem]"
            icon="i-heroicons-arrow-down-16-solid"
            @click="descendLevel(node?.id)"
          />
        </UCard>
      </div>
    </div>
  </UCarousel>
</template>
<script setup lang="ts">
defineProps(["sliderItems", "userIsCreator", "isNotValid"]);

const { delete: deleteStrapi } = useStrapi();
const isSlideroverOpen = ref(false);
const { fetchUser } = useStrapiAuth();
const ownUser = await fetchUser();

const refresh = inject("refresh");

const deleteReason = async (id: string) => {
  await deleteStrapi("nodes", id);
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
