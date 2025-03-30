<template>
  <UContainer>
    <UContainer class="flex justify-center items-center mt-12">
      <UAvatar
        v-if="socialData?.currentUser?.avatar"
        :src="useStrapiMedia(socialData?.currentUser?.avatar?.url)"
        :alt="socialData?.currentUser?.username"
        size="3xl"
        class="shadow-2xl relative"
      >
        <UButton
          icon="heroicons:cog"
          class="absolute -top-2 -right-2 z-10"
          @click="isSettingsOpen = true"
        />
      </UAvatar>
    </UContainer>
    <UContainer>
      <h1 class="text-center mt-8 text-2xl">
        {{ socialData?.currentUser?.username }}
      </h1>
      <p v-if="socialData?.currentUser?.createdAt" class="text-center text-sm">
        {{ $t("account.joined") }} :
        {{ formatDate(socialData.currentUser.createdAt, locale) }}
      </p>
    </UContainer>
    <USeparator
      class="my-8"
      :label="$t('account.myBeliefs')"
      :ui="{ label: 'text-4xl' }"
    />
    <NewArgumentModal
      :is-open="isModalOpen"
      @refresh="refresh"
      @update:is-open="isModalOpen = $event"
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
      <UCard class="flex items-center justify-center p-5">
        <UButton @click="isModalOpen = true">+</UButton>
      </UCard>
    </div>
    <USeparator
      class="my-8"
      :label="$t('account.myArguments')"
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
          >Zum Argument</UButton
        >
        <UChip
          v-else
          class="cursor-pointer"
          text="Argumentanfrage zurückziehen"
          size="2xl"
          @click="withdrawArgumentRequest(argument.id)"
        >
          <UButton disabled>Pending...</UButton>
        </UChip>
        <UBadge v-if="argument.finished" color="error">Geschlossen</UBadge>
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
          >Zum Argument</UButton
        >
        <div v-else>
          <UButton @click="acceptArgumentRequest(argument.id)"
            >Argumentanfrage annehmen</UButton
          >
          <UButton color="error" @click="rejectArgumentRequest(argument.id)"
            >Argumentanfrage ablehnen</UButton
          >
        </div>
        <UBadge v-if="argument.finished" color="error">Geschlossen</UBadge>
      </UCard>
    </div>
    <div v-else>
      <UCard class="text-center">
        <UAlert type="warning" title="Nothing Here!" />
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
        <div class="space-y-6">
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
      :is-friends-management-open="isFriendsManagementOpen"
      @refresh="refresh"
      @update:is-open="isFriendsManagementOpen = $event"
    />
    <div class="flex items-start gap-4 mt-32">
      <div class="flex-1">
        <USeparator
          :label="$t('account.friends')"
          :ui="{ label: 'text-4xl' }"
          class="mb-4"
        />
        <UContainer>
          <div
            v-for="friend in socialData?.currentUser?.friends"
            :key="friend.id"
          >
            <div class="flex">
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
      </div>
      <UButton
        color="primary"
        class="basis-1/2 ml-4 h-14 px-6 text-lg font-semibold flex items-center justify-center"
        @click="isFriendsManagementOpen = true"
      >
        {{ $t("account.addFriends") }}
      </UButton>
    </div>
    <div class="flex items-start gap-4">
      <div class="flex-1">
        <USeparator
          :label="$t('account.achievements')"
          :ui="{ label: 'text-4xl' }"
          class="mb-4"
        />
        <UContainer>
          <div
            v-for="achievement in socialData?.currentUser?.achievements"
            :key="achievement.id"
          >
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

const { data: socialData, refresh } = useAsyncData("socialData", async () => {
  const currentUser = await find("users/me", {
    populate: {
      friends: true,
      created: { populate: { opponent: true, tags: true, finished: true } },
      isOpponent: true,
      avatar: true,
      achievements: true,
    },
  });

  const currentUserId = currentUser?.data?.id;

  const friendIds =
    currentUser?.data?.friends?.map((friend) => friend.id) || [];

  const excludeIds = [currentUserId, ...friendIds];

  const friendRequests = await find("friend-requests", {
    populate: ["sender", "receiver"],
    filters: {
      $or: [
        { sender: { id: { $eq: currentUserId } } },
        { receiver: { id: { $eq: currentUserId } } },
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
    currentUserId,
    friendRequests,
    suggestedFriends,
    currentUser,
  };
});

const sentArgumentRequests = computed(() => {
  return (
    socialData.value?.currentUser?.created?.filter((e) => e.opponent) || []
  );
});

const receivedArgumentRequests = computed(() => {
  return socialData.value?.currentUser?.isOpponent || [];
});

const standpoints = computed(() => {
  return (
    socialData.value?.currentUser?.created?.filter((e) => !e.opponent) || []
  );
});

const isFriendsManagementOpen = ref(false);
const isModalOpen = ref(false);

const acceptArgumentRequest = async (id) => {
  await update("argument-trees", id, { opponentAccepted: true });
  refresh();
};

const rejectArgumentRequest = async (id) => {
  await _delete("argument-trees", id);
  refresh();
};

const withdrawArgumentRequest = async (id) => {
  await _delete("argument-trees", id);
  refresh();
};

const onDeleteUser = async () => {
  try {
    await client(`/users/${socialData.value?.currentUser.id}`, {
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
  formData.append("refId", socialData.value?.currentUser.id);
  formData.append("field", "avatar");

  await client("/upload", {
    method: "POST",
    body: formData,
  });
  refresh();
};
</script>
