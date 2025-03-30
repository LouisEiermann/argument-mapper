<template>
  <UModal v-model="open">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3
            class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
          >
            Freunde hinzufügen
          </h3>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-heroicons-x-mark-20-solid"
            class="-my-1"
            @click="$emit('update:isOpen')"
          />
        </div>
      </template>

      <div v-if="pending" class="flex justify-center py-4">
        <UCard :loading="true">
          <div class="h-32"></div>
        </UCard>
      </div>

      <template v-else>
        <div class="space-y-6">
          <!-- Suggested Friends Section -->
          <div>
            <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-4">
              Vorschläge:
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
                      :src="suggestedFriend.avatar.url"
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
                      Profil
                    </UButton>
                    <UButton
                      v-if="
                        !data?.sentFriendRequests.find((e) => {
                          return (
                            e.attributes.receiver.data.id === suggestedFriend.id
                          );
                        }) &&
                        !data?.receivedFriendRequests.find((e) => {
                          return (
                            e.attributes.sender.data.id === suggestedFriend.id
                          );
                        })
                      "
                      color="primary"
                      @click="sendFriendRequest(suggestedFriend.id)"
                    >
                      Anfrage senden
                    </UButton>
                    <div
                      v-else-if="
                        data?.receivedFriendRequests.find((e) => {
                          return (
                            e.attributes.sender.data.id === suggestedFriend.id
                          );
                        })
                      "
                      class="flex items-center gap-2"
                    >
                      <UButton
                        color="primary"
                        @click="
                          acceptFriendRequest(
                            data?.receivedFriendRequests.find((e) => {
                              return (
                                e.attributes.sender.data.id ===
                                suggestedFriend.id
                              );
                            })?.id
                          )
                        "
                      >
                        Annehmen
                      </UButton>
                      <UButton
                        color="error"
                        variant="soft"
                        @click="rejectFriendRequest(receivedFriendRequests.id)"
                      >
                        Ablehnen
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
                            return (
                              e.attributes.receiver.data.id ===
                              suggestedFriend.id
                            );
                          })?.id
                        )
                      "
                    >
                      <UButton disabled>Ausstehend...</UButton>
                    </UChip>
                  </div>
                </div>
              </UCard>
            </div>
          </div>

          <!-- Friend Requests Section -->
          <div v-if="data?.receivedFriendRequests?.length">
            <USeparator label="Anfragen" />
            <div class="space-y-4">
              <UCard
                v-for="receivedFriendRequest in data.receivedFriendRequests"
                :key="receivedFriendRequest.id"
              >
                <div class="flex items-center justify-between gap-4">
                  <div class="flex items-center gap-3">
                    <UAvatar
                      v-if="
                        receivedFriendRequest.attributes.sender.data.attributes
                          .avatar
                      "
                      :src="
                        receivedFriendRequest.attributes.sender.data.attributes
                          .avatar.url
                      "
                      :alt="
                        receivedFriendRequest.attributes.sender.data.attributes
                          .username
                      "
                    />
                    <span
                      class="text-sm font-medium text-gray-900 dark:text-white"
                    >
                      {{
                        receivedFriendRequest.attributes.sender.data.attributes
                          .username
                      }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    <UButton
                      color="neutral"
                      variant="ghost"
                      icon="i-heroicons-user-circle"
                      @click="visitProfile(receivedFriendRequest.id)"
                    >
                      Profil
                    </UButton>
                    <UButton
                      color="primary"
                      @click="acceptFriendRequest(receivedFriendRequest.id)"
                    >
                      Annehmen
                    </UButton>
                    <UButton
                      color="error"
                      variant="soft"
                      @click="rejectFriendRequest(receivedFriendRequest.id)"
                    >
                      Ablehnen
                    </UButton>
                  </div>
                </div>
              </UCard>
            </div>
          </div>

          <!-- Search Friends Section -->
          <div>
            <USeparator label="Freunde suchen" />
            <div class="mt-4 space-y-4">
              <UInput
                v-model="searchForFriendsSearchTerm"
                icon="i-heroicons-magnifying-glass"
                placeholder="Nutzernamen eingeben"
                @keyup.enter="searchFriends"
              />
              <UButton
                color="primary"
                :loading="searching"
                @click="searchFriends"
              >
                Suchen
              </UButton>
            </div>

            <div v-if="foundUsers.length" class="mt-4 space-y-4">
              <UCard v-for="foundUser in foundUsers" :key="foundUser.id">
                <div class="flex items-center justify-between gap-4">
                  <div class="flex items-center gap-3">
                    <UAvatar
                      v-if="foundUser.avatar"
                      :src="foundUser.avatar.url"
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
                      Profil
                    </UButton>
                    <UButton
                      v-if="
                        !data?.sentFriendRequests.find((e) => {
                          return e.attributes.receiver.data.id === foundUser.id;
                        })
                      "
                      color="primary"
                      @click="sendFriendRequest(foundUser.id)"
                    >
                      Anfrage senden
                    </UButton>
                    <UChip
                      v-else
                      color="neutral"
                      variant="soft"
                      class="cursor-pointer"
                      @click="withdrawFriendRequest"
                    >
                      <UButton disabled>Ausstehend...</UButton>
                    </UChip>
                  </div>
                </div>
              </UCard>
            </div>
          </div>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script lang="ts" setup>
const emit = defineEmits(["refresh", "update:isOpen"]);
const props = defineProps({
  isFriendsManagementOpen: {
    type: Boolean,
    default: false,
  },
});

const { find, create, update, delete: _delete } = useStrapi();
const userStore = useUserStore();
const foundUsers = ref([]);
const searchForFriendsSearchTerm = ref("");
const searching = ref(false);

const open = computed({
  get() {
    return props.isFriendsManagementOpen;
  },
  set(value) {
    emit("update:isOpen", value);
  },
});

const { data, pending, refresh } = useAsyncData("data", async () => {
  const currentUser = await find("users/me", {
    populate: ["friends", "created", "isOpponent", "avatar", "achievements"],
  });

  const currentUserId = currentUser.id;
  const friendIds = currentUser.friends.map((friend: { id: any }) => friend.id);
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
    (e) => e.attributes.sender.data.id === currentUserId
  );

  const receivedFriendRequests = friendRequests.data.filter(
    (e) =>
      e.attributes.receiver.data.id === currentUserId &&
      e.attributes.status === "pending"
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
    currentUser,
  };
});

const acceptFriendRequest = async (id: number) => {
  await update("friend-requests", id, { status: "accepted" });
  refresh();
};

const rejectFriendRequest = async (id: number) => {
  await update("friend-requests", id, { status: "rejected" });
  refresh();
};

const sendFriendRequest = async (receiverId: any) => {
  await create("friend-requests", {
    sender: data.value?.currentUser.id,
    receiver: receiverId,
  });
  refresh();
};

const searchFriends = async () => {
  if (!searchForFriendsSearchTerm.value) return;

  searching.value = true;
  foundUsers.value = [];

  try {
    const currentUserId = data.value?.currentUser.id;
    const friendIds = data.value?.currentUser.friends.map(
      (friend: { id: any }) => friend.id
    );
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
    });

    result.forEach((e: any) => {
      foundUsers.value.push(e);
    });
  } finally {
    searching.value = false;
  }
};

const withdrawFriendRequest = async (id: number) => {
  await _delete("friend-requests", id);
  refresh();
};

const visitProfile = (id: any) => {
  navigateTo(`/users/${id}`);
};
</script>
