<template>
  <UContainer v-if="data?.user">
    <h1 class="text-center mt-8">
      {{ data?.user.username }}
    </h1>
    <p v-if="data?.user">
      {{ $t("account.joined") }}: {{ formatDate(data.user.createdAt, locale) }}
    </p>
  </UContainer>
  <UContainer v-if="data?.user">
    <UAvatar
      v-if="data?.user.avatar"
      :src="useStrapiMedia(data.user.avatar.url)"
      :alt="data.user.username"
      size="3xl"
    />
  </UContainer>
  <div class="grid-container" v-if="data?.user && data?.user.created">
    <UCard
      v-for="standpoint in data?.user.created.filter((e) => {
        return !e.opponentAccepted;
      })"
      class="grid-item"
    >
      {{ standpoint.id }}
      <UButton :to="'/argument/' + standpoint.id">{{
        $t("account.toBelief")
      }}</UButton>
    </UCard>
  </div>
  <NewArgumentModal :is-debate="true" :other-user="data?.user" />
</template>
<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

const { findOne } = useStrapi();
const { fetchUser } = useStrapiAuth();
const { formatDate } = useDateFormatter();
const { params } = useRoute();

const { locale } = useI18n();

const { data, refresh } = useAsyncData("data", async () => {
  const user = await findOne("users", params.id, {
    populate: ["friends", "created", "isOpponent", "avatar"],
  });

  const ownUser = await fetchUser();

  return { ownUser, user };
});
</script>
