<template>
  <div
    v-if="user && data.length > 0"
    class="flex flex-col items-center justify-center mt-4"
  >
    <div ref="el">
      <UCard v-for="item in data" class="mb-4">
        <template #header>
          <div class="flex items-center gap-4">
            <UAvatar
              v-if="
                item.attributes.creator.data.attributes.avatar.data?.attributes
                  .url
              "
              :src="
                useStrapiMedia(
                  item.attributes.creator.data.attributes.avatar.data
                    ?.attributes.url
                )
              "
            />
            <UAvatar
              v-else
              :src="null"
              :alt="item.attributes.creator.data.attributes.username"
            />
            <div v-if="item.attributes.opponent.data">vs</div>
            <UAvatar
              v-if="
                item.attributes.opponent.data &&
                item.attributes.opponent.data.attributes.avatar.data?.attributes
                  .url
              "
              :src="
                useStrapiMedia(
                  item.attributes.opponent.data.attributes.avatar.data
                    ?.attributes.url
                )
              "
            />
            <UAvatar
              v-else-if="item.attributes.opponent.data"
              :src="null"
              :alt="item.attributes.opponent.data.attributes.username"
            />

            <p>{{ item.attributes.title }}</p>
            <p class="text-sm ml-auto">
              {{ timeSincePosted(item.attributes.createdAt) }}
            </p>
          </div>
        </template>
        {{ item.attributes.title }}
        <div class="flex gap-2">
          <UBadge v-if="item.attributes.finished" color="error"
            >Geschlossen</UBadge
          >
          <UBadge v-if="!item.attributes.opponent.data" color="primary"
            >Standpunkt</UBadge
          >
        </div>
        <template #footer>
          <div class="flex flex-col gap-4">
            <UProgress
              v-if="item.opponent"
              :value="
                useVoteCalculator(item.attributes.votes).creatorPercentage
              "
            />
            <div class="flex justify-between">
              <UButton :to="'/argument/' + item.id">Zum Argument</UButton>
              <div class="flex justify-between items-center">Teilen</div>
            </div>
          </div>
        </template>
      </UCard>
    </div>
    <UButton class="mt-8" @click="resetList()">Refresh</UButton>
  </div>
</template>
<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

import { useInfiniteScroll } from "@vueuse/core";

const user = useStrapiUser();
const { find } = useStrapi();
const route = useRoute();

const el = ref<HTMLElement | null>(null);
const data = ref<any[]>([]);
const hasMoreData = ref(true);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const { timeSincePosted } = useDateFormatter();

const fetchData = async (page: number, pageSize: number) => {
  const response = await find("argument-trees", {
    pagination: { page, pageSize },
    filters: {
      $or: [
        {
          $and: [
            { opponentAccepted: { $eq: true } },
            { opponent: { $ne: user.value?.id } },
            { creator: { $ne: user.value?.id } },
          ],
        },
        {
          $and: [
            { opponent: { $null: true } },
            { creator: { $ne: user.value?.id } },
          ],
        },
      ],
    },
    populate: {
      votes: true,
      creator: { populate: ["avatar"] },
      opponent: { populate: ["avatar"] },
      tags: {
        populate: ["defaultMood", "localizations"],
      },
    },
  });
  return response.data;
};

const loadMoreData = async () => {
  if (!hasMoreData.value) return;

  const moreData = await fetchData(currentPage.value, itemsPerPage.value);
  if (moreData.length === 0) {
    hasMoreData.value = false;
  } else {
    data.value.push(...moreData);
    currentPage.value += 1;
  }
};

const fetchInitialData = async () => {
  data.value = await fetchData(1, itemsPerPage.value);
  currentPage.value = 2;
};

const { reset } = useInfiniteScroll(el, loadMoreData, { distance: 10 });

const { data: asyncData, refresh } = useAsyncData(
  "argument-trees",
  async () => {
    if (data.value.length === 0) {
      await fetchInitialData();
    }
    return data;
  }
);

function resetList() {
  data.value = [];
  hasMoreData.value = true;
  currentPage.value = 1;
  fetchInitialData();
}

onMounted(() => {
  fetchInitialData();
});

watchEffect(() => {
  if (route.fullPath) {
    resetList(); // Reset and fetch data on route change
  }
});
</script>
