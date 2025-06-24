<template>
  <UContainer class="flex flex-col gap-8 justify-center items-center">
    <UContainer class="flex justify-center items-center flex-col">
      <UAvatar
        v-if="user?.avatar"
        :src="useStrapiMedia(user?.avatar?.url)"
        :alt="user?.username"
        size="3xl"
        class="shadow-2xl relative"
      />
      <UContainer>
        <h1 class="text-center mt-2 text-4xl">
          {{ user?.username }}
        </h1>
        <p v-if="user?.createdAt" class="text-center text-sm">
          {{ $t("account.joined") }} :
          {{ formatDate(user.createdAt, locale) }}
        </p>
      </UContainer>
    </UContainer>
    <NewArgumentModal
      :is-open="isNewArgumentModalOpen"
      @refresh="refresh"
      @update:is-open="isNewArgumentModalOpen = $event"
    />
    <USeparator
      class="my-8"
      :label="$t('account.myBeliefs')"
      :ui="{ label: 'text-4xl' }"
    />
    <div class="grid grid-cols-3 gap-2.5">
      <UCard
        v-for="standpoint in standpoints"
        :key="standpoint.id"
        class="flex items-center justify-center p-5"
      >
        {{ standpoint.title }}
        <UButton :to="'/argument/' + standpoint.id">{{
          $t("account.toBelief")
        }}</UButton>
      </UCard>
    </div>
    <USeparator
      class="my-8"
      :label="$t('account.myDebates')"
      :ui="{ label: 'text-4xl' }"
    />
    <div
      v-if="sentArgumentRequests?.length || receivedArgumentRequests?.length"
      class="grid grid-cols-3 gap-2.5"
    >
      <UCard
        v-for="argument in sentArgumentRequests"
        :key="argument.id"
        class="flex items-center justify-center p-5"
      >
        {{ argument.id }}
        <UButton
          v-if="argument.opponentAccepted"
          :to="'/argument/' + argument.id"
          >{{ $t("general.toArgument") }}</UButton
        >
        <UChip
          v-else
          class="cursor-pointer"
          :text="$t('account.withdrawArgumentRequest')"
          size="2xl"
          @click="withdrawArgumentRequest(argument.id)"
        >
          <UButton disabled>{{ $t("general.pending") }}</UButton>
        </UChip>
        <UBadge v-if="argument.finished" color="error">{{
          $t("argument.closed")
        }}</UBadge>
      </UCard>
      <UCard
        v-for="argument in receivedArgumentRequests"
        :key="argument.id"
        class="flex items-center justify-center p-5"
      >
        {{ argument.id }}
        <UButton
          v-if="argument.opponentAccepted"
          :to="'/argument/' + argument.id"
          >{{ $t("general.toArgument") }}</UButton
        >
        <div v-else>
          <UButton @click="acceptArgumentRequest(argument.documentId)">{{
            $t("account.acceptArgumentRequest")
          }}</UButton>
          <UButton color="error" @click="rejectArgumentRequest(argument.id)">{{
            $t("account.rejectArgumentRequest")
          }}</UButton>
        </div>
        <UBadge v-if="argument.finished" color="error">{{
          $t("argument.closed")
        }}</UBadge>
      </UCard>
    </div>
    <div v-else>
      <UCard class="text-center">
        <UAlert type="warning" :title="$t('general.nothingHere')" />
      </UCard>
    </div>
    <UModal
      :title="$t('account.settings')"
      :close="{
        color: 'neutral',
        variant: 'ghost',
        icon: 'i-heroicons-x-mark',
      }"
    >
      <UButton icon="heroicons:cog">{{ $t("account.settings") }}</UButton>

      <template #body>
        <div class="space-y-6 flex flex-col">
          <div>
            <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-4">
              {{ $t("account.changeAvatar") }}
            </h4>
            <UInput
              type="file"
              icon="i-heroicons-photo"
              accept="image/*"
              class="upload-avatar"
              @change="handleFileChange"
            />
          </div>

          <div>
            <USeparator :label="$t('account.dangerZone')" color="error" />
            <div class="mt-4">
              <UButton color="error" variant="soft" @click="onDeleteUser">
                {{ $t("account.deleteAccount") }}
              </UButton>
            </div>
          </div>
        </div>
      </template>
    </UModal>
    <FriendManagement
      :is-friends-management-open="isFriendsManagementModalOpen"
      @refresh="refresh"
      @update:is-open="isFriendsManagementModalOpen = $event"
    />
    <USeparator
      :label="$t('account.friends')"
      :ui="{ label: 'text-4xl' }"
      class="mb-4 my-8"
    />
    <UContainer>
      <div v-for="friend in user?.friends" :key="friend.id">
        <div class="flex items-center gap-4">
          {{ friend.username }}
          <UButton @click="navigateTo(`/users/${friend.id}`)">
            {{ $t("account.userProfile") }}
          </UButton>
          <UButton @click="navigateTo(`/users/${friend.id}/chat`)">
            {{ $t("account.chat") }}
          </UButton>
        </div>
      </div>
    </UContainer>
    <div class="flex items-start gap-4">
      <div class="flex-1">
        <USeparator
          :label="$t('account.achievements')"
          :ui="{ label: 'text-4xl' }"
          class="mb-4"
        />
        <UContainer>
          <div v-for="achievement in user?.achievements" :key="achievement.id">
            <UAvatar :src="useStrapiMedia(achievement.image.url)" />
            {{ achievement.name }}
          </div>
        </UContainer>
      </div>
      <UButton
        color="primary"
        to="/learn"
        class="basis-1/2 ml-4 h-14 px-6 text-lg font-semibold flex items-center justify-center"
      >
        {{ $t("account.learn") }}
      </UButton>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

const { find, update, delete: _delete } = useStrapi();
const client = useStrapiClient();
const { formatDate } = useDateFormatter();
const { locale } = useI18n();
const user = useStrapiUser();

const isFriendsManagementModalOpen = ref(false);
const isNewArgumentModalOpen = ref(false);

const { data: socialData, refresh } = useAsyncData("socialData", async () => {
  const friendIds = user.value?.friends?.map((friend: any) => friend.id) || [];
  const excludeIds = [user.value?.id, ...friendIds];

  const friendRequests = await find("friend-requests", {
    populate: ["sender", "receiver"],
    filters: {
      $or: [
        { sender: { id: { $eq: user.value?.id } } },
        { receiver: { id: { $eq: user.value?.id } } },
      ],
    },
  });

  const suggestedFriends = await find("users", {
    filters: {
      id: {
        $notIn: excludeIds,
      },
    },
    pagination: {
      start: 1,
      limit: 5,
    },
  });

  return {
    friendRequests,
    suggestedFriends,
  };
});

const sentArgumentRequests = computed(() => {
  return user.value?.created?.filter((e: any) => e.opponent) || [];
});

const receivedArgumentRequests = computed(() => {
  return user.value?.isOpponent || [];
});

const standpoints = computed(() => {
  return user.value?.created?.filter((e: any) => !e.opponent) || [];
});

const acceptArgumentRequest = async (id: string) => {
  await update("argument-trees", id, { opponentAccepted: true });
  refresh();
};

const rejectArgumentRequest = async (id: string) => {
  await _delete("argument-trees", id);
  refresh();
};

const withdrawArgumentRequest = async (id: string) => {
  await _delete("argument-trees", id);
  refresh();
};

const onDeleteUser = async () => {
  try {
    await client(`/users/${user.value?.id}`, {
      method: "DELETE",
    });

    await navigateTo("/");
  } catch (e) {
    console.error(e);
  }
};

const handleFileChange = async (event) => {
  const formData = new FormData();

  formData.append("files", event.target.files[0]);
  formData.append("ref", "plugin::users-permissions.user");
  formData.append("refId", user.value?.id);
  formData.append("field", "avatar");

  await client("/upload", {
    method: "POST",
    body: formData,
  });
  refresh();
};
</script>
