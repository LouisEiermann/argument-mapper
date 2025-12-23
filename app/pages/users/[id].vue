<template>
  <UContainer class="py-10" v-if="data?.user">
    <div class="mx-auto max-w-5xl space-y-8">
      <UCard>
        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <UAvatar
            v-if="data.user.avatar?.url"
            :src="useStrapiMedia(data.user.avatar.url)"
            :alt="data.user.username"
            size="3xl"
            class="shadow-xl"
          />
          <UAvatar v-else :alt="data.user.username" size="3xl" class="shadow-xl" />

          <div class="flex-1 w-full">
            <div
              class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
            >
              <div class="text-center sm:text-left">
                <h1 class="text-3xl sm:text-4xl font-semibold tracking-tight">
                  {{ data.user.username }}
                </h1>
                <p
                  v-if="data.user.createdAt"
                  class="mt-1 text-sm text-(--ui-text-muted)"
                >
                  {{ $t("account.joined") }}:
                  {{ formatDate(data.user.createdAt, locale) }}
                </p>
              </div>

              <div class="flex flex-wrap gap-2 justify-center sm:justify-end">
                <UButton
                  color="neutral"
                  variant="outline"
                  icon="i-heroicons-chat-bubble-left-right"
                  :to="`/users/${userId}/chat`"
                >
                  {{ $t("account.chat") }}
                </UButton>
                <UButton
                  icon="i-heroicons-plus"
                  @click="isNewDebateModalOpen = true"
                >
                  {{ $t("argument.new.newDebate") }}
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <NewArgumentModal
        v-model:open="isNewDebateModalOpen"
        :show-trigger="false"
        :is-debate="true"
        :other-user="data.user"
      />

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <UCard class="lg:col-span-2">
          <template #header>
            <div class="flex items-center justify-between gap-4">
              <h2 class="text-lg font-semibold">{{ $t("account.myBeliefs") }}</h2>
              <UBadge color="neutral" variant="subtle">{{ standpoints.length }}</UBadge>
            </div>
          </template>

          <div v-if="standpoints.length" class="divide-y divide-(--ui-border)">
            <div
              v-for="standpoint in standpoints"
              :key="standpoint.id"
              class="py-3 flex items-center justify-between gap-4"
            >
              <div class="min-w-0">
                <div class="font-medium truncate">{{ standpoint.title }}</div>
              </div>
              <UButton size="sm" :to="'/argument/' + standpoint.id">
                {{ $t("account.toBelief") }}
              </UButton>
            </div>
          </div>
          <UAlert v-else type="warning" :title="$t('general.nothingHere')" />
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center justify-between gap-4">
              <h2 class="text-lg font-semibold">{{ $t("account.achievements") }}</h2>
              <UBadge color="neutral" variant="subtle">{{
                data.user.achievements?.length || 0
              }}</UBadge>
            </div>
          </template>

          <div v-if="data.user.achievements?.length" class="space-y-3">
            <div
              v-for="achievement in data.user.achievements"
              :key="achievement.id"
              class="flex items-center gap-3"
            >
              <UAvatar
                v-if="achievement.image?.url"
                :src="useStrapiMedia(achievement.image.url)"
                size="sm"
              />
              <div class="min-w-0">
                <div class="font-medium truncate">{{ achievement.name }}</div>
              </div>
            </div>
          </div>
          <UAlert v-else type="warning" :title="$t('general.nothingHere')" />
        </UCard>
      </div>
    </div>
  </UContainer>
</template>
<script setup lang="ts">
definePageMeta({
  middleware: ["auth", "friends-only"],
});

const { findOne } = useStrapi();
const { fetchUser } = useStrapiAuth();
const { formatDate } = useDateFormatter();
const route = useRoute();
const isNewDebateModalOpen = ref(false);
const userId = computed(() => {
  const id = route.params.id;
  return Array.isArray(id) ? id[0] : String(id);
});

const { locale } = useI18n();

const { data, refresh } = useAsyncData(
  `user:${userId.value}`,
  async () => {
    const user = await findOne("users", userId.value, {
      populate: {
        friends: true,
        created: true,
        isOpponent: true,
        avatar: true,
        achievements: { populate: { image: true } },
      },
    });

    const ownUser = await fetchUser();

    return { ownUser, user };
  },
  { watch: [userId] },
);

const standpoints = computed(() => {
  const created = data.value?.user?.created;
  if (!Array.isArray(created)) return [];
  return created.filter((e: any) => !e.opponent);
});
</script>
