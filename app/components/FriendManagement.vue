<template>
  <UModal
    :close="{
      color: 'neutral',
      variant: 'ghost',
      icon: 'i-heroicons-x-mark',
    }"
    :title="$t('account.addFriends')"
    :description="$t('account.addFriendsDescription')"
  >
    <UButton icon="i-heroicons-user-group">{{
      $t("account.addFriends")
    }}</UButton>
    <template #body>
      <div class="space-y-6 flex flex-col">
        <div>
          <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-4">
            {{ $t("friends.suggestions") }}
          </h4>
          <div class="space-y-4">
            <UCard
              v-for="suggestedFriend in data?.suggestedFriends"
              :key="suggestedFriend.id"
            >
              <div class="flex items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                  <UAvatar
                    v-if="suggestedFriend.avatar"
                    :src="useStrapiMedia(suggestedFriend.avatar.url)"
                    :alt="suggestedFriend.username"
                  />
                  <span
                    class="text-sm font-medium text-gray-900 dark:text-white"
                  >
                    {{ suggestedFriend.username }}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <UButton
                    color="neutral"
                    variant="ghost"
                    icon="i-heroicons-user-circle"
                    @click="visitProfile(suggestedFriend.id)"
                  >
                    {{ $t("friends.profile") }}
                  </UButton>
                  <UButton
                    v-if="
                      !data?.sentFriendRequests.find((e) => {
                        return e.receiver.id === suggestedFriend.id;
                      }) &&
                      !data?.receivedFriendRequests.find((e) => {
                        return e.sender.id === suggestedFriend.id;
                      })
                    "
                    color="primary"
                    @click="sendFriendRequest(suggestedFriend.id)"
                  >
                    {{ $t("friends.sendRequest") }}
                  </UButton>
                  <div
                    v-else-if="
                      data?.receivedFriendRequests.find((e) => {
                        return e.sender.id === suggestedFriend.id;
                      })
                    "
                    class="flex items-center gap-2"
                  >
                    <UButton
                      color="primary"
                      @click="
                        acceptFriendRequest(
                          data?.receivedFriendRequests.find((e) => {
                            return e.sender.id === suggestedFriend.id;
                          })?.documentId
                        )
                      "
                    >
                      {{ $t("friends.accept") }}
                    </UButton>
                    <UButton
                      color="error"
                      variant="soft"
                      @click="
                        rejectFriendRequest(receivedFriendRequests.documentId)
                      "
                    >
                      {{ $t("friends.reject") }}
                    </UButton>
                  </div>
                  <UChip
                    v-else
                    color="neutral"
                    variant="soft"
                    class="cursor-pointer"
                    @click="
                      withdrawFriendRequest(
                        data?.sentFriendRequests.find((e) => {
                          return e.receiver.id === suggestedFriend.id;
                        })?.documentId
                      )
                    "
                  >
                    <UButton disabled>{{ $t("friends.pending") }}</UButton>
                  </UChip>
                </div>
              </div>
            </UCard>
          </div>
        </div>

        <!-- Friend Requests Section -->
        <div v-if="data?.receivedFriendRequests?.length">
          <USeparator :label="$t('friends.requests')" />
          <div class="space-y-4">
            <UCard
              v-for="receivedFriendRequest in data.receivedFriendRequests"
              :key="receivedFriendRequest.id"
            >
              <div class="flex items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                  <UAvatar
                    v-if="receivedFriendRequest.sender.avatar"
                    :src="
                      useStrapiMedia(receivedFriendRequest.sender.avatar.url)
                    "
                    :alt="receivedFriendRequest.sender.username"
                  />
                  <span
                    class="text-sm font-medium text-gray-900 dark:text-white"
                  >
                    {{ receivedFriendRequest.sender.username }}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <UButton
                    color="neutral"
                    variant="ghost"
                    icon="i-heroicons-user-circle"
                    @click="visitProfile(receivedFriendRequest.id)"
                  >
                    {{ $t("friends.profile") }}
                  </UButton>
                  <UButton
                    color="primary"
                    @click="
                      acceptFriendRequest(receivedFriendRequest.documentId)
                    "
                  >
                    {{ $t("friends.accept") }}
                  </UButton>
                  <UButton
                    color="error"
                    variant="soft"
                    @click="
                      rejectFriendRequest(receivedFriendRequest.documentId)
                    "
                  >
                    {{ $t("friends.reject") }}
                  </UButton>
                </div>
              </div>
            </UCard>
          </div>
        </div>

        <!-- Search Friends Section -->
        <div>
          <USeparator :label="$t('friends.searchFriends')" />
          <div class="mt-4 flex gap-4">
            <UInput
              v-model="searchForFriendsSearchTerm"
              icon="i-heroicons-magnifying-glass"
              :placeholder="$t('friends.enterUsername')"
              class="flex-1"
              @keyup.enter="searchFriends"
            />
            <UButton
              color="primary"
              :loading="searching"
              @click="searchFriends"
            >
              {{ $t("friends.search") }}
            </UButton>
          </div>

          <div v-if="foundUsers.length" class="mt-4 space-y-4">
            <UCard v-for="foundUser in foundUsers" :key="foundUser.id">
              <div class="flex items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                  <UAvatar
                    v-if="foundUser.avatar"
                    :src="useStrapiMedia(foundUser.avatar.url)"
                    :alt="foundUser.username"
                  />
                  <span
                    class="text-sm font-medium text-gray-900 dark:text-white"
                  >
                    {{ foundUser.username }}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <UButton
                    color="neutral"
                    variant="ghost"
                    icon="i-heroicons-user-circle"
                    @click="visitProfile(foundUser.id)"
                  >
                    {{ $t("friends.profile") }}
                  </UButton>
                  <UButton
                    v-if="
                      !data?.sentFriendRequests.find((e) => {
                        return e.receiver.id === foundUser.id;
                      })
                    "
                    color="primary"
                    @click="sendFriendRequest(foundUser.id)"
                  >
                    {{ $t("friends.sendRequest") }}
                  </UButton>
                  <UChip
                    v-else
                    color="neutral"
                    variant="soft"
                    class="cursor-pointer"
                    @click="withdrawFriendRequest"
                  >
                    <UButton disabled>{{ $t("friends.pending") }}</UButton>
                  </UChip>
                </div>
              </div>
            </UCard>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
const { find, create, update, delete: _delete } = useStrapi();
const foundUsers = ref([]);
const searchForFriendsSearchTerm = ref("");
const searching = ref(false);
const user = useStrapiUser();

const { data, refresh } = useAsyncData("friendManagement", async () => {
  const currentUserId = user.value?.id;
  const friendIds = user.value?.friends?.map((friend) => friend.id) || [];
  const excludeIds = [currentUserId, ...friendIds];

  // Fetch friend requests where the current user is either sender or receiver
  const friendRequests = await find("friend-requests", {
    populate: ["sender", "receiver"],
    filters: {
      $or: [
        { sender: { id: { $eq: currentUserId } } },
        { receiver: { id: { $eq: currentUserId } } },
      ],
    },
  });

  const sentFriendRequests = friendRequests.data.filter(
    (e) => e.sender.id === currentUserId
  );

  const receivedFriendRequests = friendRequests.data.filter(
    (e) => e.receiver.id === currentUserId && e.requestStatus === "pending"
  );

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
    sentFriendRequests,
    receivedFriendRequests,
    suggestedFriends,
  };
});

const acceptFriendRequest = async (documentId: number) => {
  await update("friend-requests", documentId, { requestStatus: "accepted" });
  refresh();
};

const rejectFriendRequest = async (documentId: number) => {
  await update("friend-requests", documentId, { requestStatus: "rejected" });
  refresh();
};

const sendFriendRequest = async (receiverId: any) => {
  await create("friend-requests", {
    sender: user.value?.id,
    receiver: receiverId,
  });
  refresh();
};

const searchFriends = async () => {
  if (!searchForFriendsSearchTerm.value) return;

  searching.value = true;
  foundUsers.value = [];

  try {
    const currentUserId = user.value?.id;
    const friendIds = user.value?.friends?.map((friend) => friend.id) || [];
    const excludeIds = [currentUserId, ...friendIds];

    const result = await find("users", {
      filters: {
        id: {
          $notIn: excludeIds,
        },
        username: {
          $contains: searchForFriendsSearchTerm.value,
        },
      },
      pagination: {
        start: 0,
        limit: 10,
      },
    });

    result.forEach((e) => {
      foundUsers.value.push(e);
    });
  } finally {
    searching.value = false;
  }
};

const withdrawFriendRequest = async (documentId: number) => {
  await _delete("friend-requests", documentId);
  refresh();
};

const visitProfile = (id: any) => {
  navigateTo(`/users/${id}`);
};
</script>
