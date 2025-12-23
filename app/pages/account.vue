<template>
  <UContainer class="py-10">
    <div class="mx-auto max-w-5xl space-y-8">
      <!-- Profile -->
      <UCard>
        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <UAvatar
            v-if="user?.avatar"
            :src="useStrapiMedia(user?.avatar?.url)"
            :alt="user?.username"
            size="3xl"
            class="shadow-xl"
          />
          <div class="flex-1 w-full">
            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div class="text-center sm:text-left">
                <h1 class="text-3xl sm:text-4xl font-semibold tracking-tight">
                  {{ user?.username }}
                </h1>
                <p v-if="user?.createdAt" class="mt-1 text-sm text-(--ui-text-muted)">
                  {{ $t("account.joined") }}:
                  {{ formatDate(user.createdAt, locale) }}
                </p>
              </div>

              <div class="flex flex-wrap gap-2 justify-center sm:justify-end">
                <UButton
                  icon="i-heroicons-plus"
                  @click="isNewArgumentModalOpen = true"
                >
                  {{ $t("account.newArgument") }}
                </UButton>
                <UButton
                  color="neutral"
                  variant="outline"
                  icon="i-heroicons-user-group"
                  @click="isFriendsManagementModalOpen = true"
                >
                  {{ $t("account.addFriends") }}
                </UButton>
                <UButton
                  color="primary"
                  variant="soft"
                  icon="i-heroicons-academic-cap"
                  to="/learn"
                >
                  {{ $t("account.learn") }}
                </UButton>
                <UButton
                  color="neutral"
                  variant="outline"
                  icon="i-heroicons-cog-6-tooth"
                  @click="isSettingsOpen = true"
                >
                  {{ $t("account.settings") }}
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Modals -->
      <NewArgumentModal
        v-model:open="isNewArgumentModalOpen"
        :show-trigger="false"
      />
      <FriendManagement
        v-model:open="isFriendsManagementModalOpen"
        :show-trigger="false"
      />
      <UModal
        v-model:open="isSettingsOpen"
        :title="$t('account.settings')"
        :description="$t('account.settingsDescription')"
        :close="{
          color: 'neutral',
          variant: 'ghost',
          icon: 'i-heroicons-x-mark',
        }"
      >
        <template #body>
          <div class="space-y-6 flex flex-col">
            <div>
              <h4 class="text-sm font-medium mb-4">
                {{ $t("account.changeUsername") }}
              </h4>
              <UFormField
                :label="$t('account.username')"
                name="username"
                :help="$t('account.changeUsernameHelp')"
              >
                <UInput
                  v-model="usernameDraft"
                  icon="i-heroicons-user"
                  autocomplete="username"
                  :placeholder="$t('account.username')"
                  :disabled="usernameUpdating"
                />
              </UFormField>
              <div class="mt-3 flex justify-end">
                <UButton
                  size="sm"
                  :loading="usernameUpdating"
                  :disabled="!canUpdateUsername || usernameUpdating"
                  @click="updateUsername"
                >
                  {{ $t("general.save") }}
                </UButton>
              </div>
            </div>

            <USeparator />

            <div>
              <h4 class="text-sm font-medium mb-4">
                {{ $t("account.changeAvatar") }}
              </h4>
              <div class="flex items-center gap-4">
                <UAvatar
                  v-if="user?.avatar?.url"
                  :src="useStrapiMedia(user.avatar.url)"
                  :alt="user?.username"
                  size="xl"
                />
                <UAvatar v-else :alt="user?.username" size="xl" />
                <div class="flex-1">
                  <UInput
                    type="file"
                    icon="i-heroicons-photo"
                    accept="image/*"
                    class="upload-avatar"
                    :disabled="avatarUploading"
                    @change="handleFileChange"
                  />
                  <p
                    v-if="avatarUploading"
                    class="mt-2 text-sm text-(--ui-text-muted)"
                  >
                    {{ $t("account.uploading") }}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <USeparator :label="$t('account.dangerZone')" color="error" />
              <div class="mt-4">
                <UButton color="error" variant="soft" @click="isDeleteConfirmOpen = true">
                  {{ $t("account.deleteAccount") }}
                </UButton>
              </div>
            </div>
          </div>
        </template>
      </UModal>

      <UModal
        v-model:open="isDeleteConfirmOpen"
        :title="$t('account.deleteAccountConfirmTitle')"
        :description="$t('account.deleteAccountConfirmDescription')"
        :close="{
          color: 'neutral',
          variant: 'ghost',
          icon: 'i-heroicons-x-mark',
        }"
      >
        <template #body>
          <div class="space-y-4">
            <UAlert
              color="error"
              variant="soft"
              :title="$t('account.deleteAccountWarningTitle')"
              :description="$t('account.deleteAccountWarningText')"
            />

            <UFormField :label="$t('account.deleteAccountTypeToConfirm')" name="deleteConfirm">
              <UInput v-model="deleteConfirmText" autocomplete="off" />
            </UFormField>

            <div class="flex justify-end gap-2">
              <UButton color="neutral" variant="outline" @click="isDeleteConfirmOpen = false">
                {{ $t("general.cancel") }}
              </UButton>
              <UButton
                color="error"
                :disabled="deleteConfirmText.trim() !== 'DELETE'"
                @click="onDeleteUser"
              >
                {{ $t("account.deleteAccountFinal") }}
              </UButton>
            </div>
          </div>
        </template>
      </UModal>

      <!-- Content -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UCard>
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
          <UAlert
            v-else
            type="warning"
            :title="$t('general.nothingHere')"
          />
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center justify-between gap-4">
              <h2 class="text-lg font-semibold">{{ $t("account.myDebates") }}</h2>
              <UBadge color="neutral" variant="subtle">{{
                sentArgumentRequests.length + receivedArgumentRequests.length
              }}</UBadge>
            </div>
          </template>

          <div
            v-if="sentArgumentRequests.length || receivedArgumentRequests.length"
            class="divide-y divide-(--ui-border)"
          >
            <div
              v-for="argument in sentArgumentRequests"
              :key="`sent-${argument.id}`"
              class="py-3 flex items-center justify-between gap-4"
            >
              <div class="min-w-0">
                <div class="font-medium truncate">
                  {{ argument.title || `#${argument.id}` }}
                </div>
                <div class="text-sm text-(--ui-text-muted) truncate" v-if="argument.opponent?.username">
                  vs {{ argument.opponent.username }}
                </div>
              </div>
              <div class="flex items-center gap-2">
                <UBadge v-if="argument.finished" color="error">{{ $t("argument.closed") }}</UBadge>
                <template v-else-if="argument.opponentAccepted">
                  <UButton size="sm" :to="'/argument/' + argument.id">
                    {{ $t("general.toArgument") }}
                  </UButton>
                </template>
                <template v-else>
                  <UButton size="sm" disabled color="neutral" variant="outline">
                    {{ $t("general.pending") }}
                  </UButton>
                  <UButton
                    size="sm"
                    color="error"
                    variant="ghost"
                    @click="withdrawArgumentRequest(argument.id)"
                  >
                    {{ $t("account.withdrawArgumentRequest") }}
                  </UButton>
                </template>
              </div>
            </div>

            <div
              v-for="argument in receivedArgumentRequests"
              :key="`received-${argument.id}`"
              class="py-3 flex items-center justify-between gap-4"
            >
              <div class="min-w-0">
                <div class="font-medium truncate">
                  {{ argument.title || `#${argument.id}` }}
                </div>
              </div>
              <div class="flex items-center gap-2">
                <UBadge v-if="argument.finished" color="error">{{ $t("argument.closed") }}</UBadge>
                <template v-else-if="argument.opponentAccepted">
                  <UButton size="sm" :to="'/argument/' + argument.id">
                    {{ $t("general.toArgument") }}
                  </UButton>
                </template>
                <template v-else>
                  <UButton size="sm" @click="acceptArgumentRequest(argument.documentId)">
                    {{ $t("account.acceptArgumentRequest") }}
                  </UButton>
                  <UButton
                    size="sm"
                    color="error"
                    variant="outline"
                    @click="rejectArgumentRequest(argument.id)"
                  >
                    {{ $t("account.rejectArgumentRequest") }}
                  </UButton>
                </template>
              </div>
            </div>
          </div>
          <UAlert
            v-else
            type="warning"
            :title="$t('general.nothingHere')"
          />
        </UCard>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <UCard class="lg:col-span-2">
          <template #header>
            <div class="flex items-center justify-between gap-4">
              <h2 class="text-lg font-semibold">{{ $t("account.friends") }}</h2>
              <UBadge color="neutral" variant="subtle">{{
                user?.friends?.length || 0
              }}</UBadge>
            </div>
          </template>

          <div v-if="user?.friends?.length" class="divide-y divide-(--ui-border)">
            <div
              v-for="friend in user?.friends"
              :key="friend.id"
              class="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div class="min-w-0">
                <div class="font-medium truncate">{{ friend.username }}</div>
              </div>
              <div class="flex items-center gap-2">
                <UButton size="sm" color="neutral" variant="outline" @click="navigateTo(`/users/${friend.id}`)">
                  {{ $t("account.userProfile") }}
                </UButton>
                <UButton size="sm" @click="navigateTo(`/users/${friend.id}/chat`)">
                  {{ $t("account.chat") }}
                </UButton>
              </div>
            </div>
          </div>
          <UAlert
            v-else
            type="warning"
            :title="$t('general.nothingHere')"
          />
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center justify-between gap-4">
              <h2 class="text-lg font-semibold">{{ $t("account.achievements") }}</h2>
              <UBadge color="neutral" variant="subtle">{{
                user?.achievements?.length || 0
              }}</UBadge>
            </div>
          </template>

          <div v-if="user?.achievements?.length" class="space-y-3">
            <div
              v-for="achievement in user?.achievements"
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
          <UAlert
            v-else
            type="warning"
            :title="$t('general.nothingHere')"
          />
        </UCard>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

import { getApiErrorI18nKey } from "~/composables/useApiErrorMessage";

const { find, update, delete: _delete } = useStrapi();
const client = useStrapiClient();
const { formatDate } = useDateFormatter();
const { locale, t } = useI18n();
const toast = useToast();
const { fetchUser } = useStrapiAuth();
const user = useStrapiUser();

const isFriendsManagementModalOpen = ref(false);
const isNewArgumentModalOpen = ref(false);
const isSettingsOpen = ref(false);
const isDeleteConfirmOpen = ref(false);
const avatarUploading = ref(false);
const usernameDraft = ref("");
const usernameUpdating = ref(false);
const deleteConfirmText = ref("");

watch(
  () => isSettingsOpen.value,
  (open) => {
    if (!open) return;
    usernameDraft.value = user.value?.username ?? "";
  },
);

watch(
  () => isDeleteConfirmOpen.value,
  (open) => {
    if (open) deleteConfirmText.value = "";
  },
);

const canUpdateUsername = computed(() => {
  const current = user.value?.username ?? "";
  const next = usernameDraft.value.trim();
  if (!next) return false;
  if (next === current) return false;
  if (next.length < 3) return false;
  return true;
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
  if (deleteConfirmText.value.trim() !== "DELETE") return;
  try {
    await client(`/users/${user.value?.id}`, {
      method: "DELETE",
    });

    isDeleteConfirmOpen.value = false;
    isSettingsOpen.value = false;
    await navigateTo("/");
  } catch (e) {
    console.error(e);
  }
};

const updateUsername = async () => {
  if (!canUpdateUsername.value) return;
  if (!user.value?.id) return;

  usernameUpdating.value = true;
  try {
    await client(`/users/${user.value.id}`, {
      method: "PUT",
      body: {
        username: usernameDraft.value.trim(),
      },
    });

    await fetchUser();
    toast.add({ title: t("notification.saved") });
  } catch (e: any) {
    console.error(e);
    toast.add({
      title: t(getApiErrorI18nKey(e)),
      description: e?.data?.error?.message || e?.message || t("notification.errorDescription"),
      color: "error",
    });
  } finally {
    usernameUpdating.value = false;
  }
};

const handleFileChange = async (event) => {
  const file = event?.target?.files?.[0];
  if (!file || !user.value?.id) return;

  const formData = new FormData();

  formData.append("files", file);
  formData.append("ref", "plugin::users-permissions.user");
  formData.append("refId", user.value?.id);
  formData.append("field", "avatar");

  avatarUploading.value = true;
  try {
    await client("/upload", {
      method: "POST",
      body: formData,
    });

    await fetchUser();
    toast.add({ title: t("notification.saved") });
  } catch (e: any) {
    console.error(e);
    toast.add({
      title: t("notification.error"),
      description: e?.data?.error?.message || e?.message || t("notification.errorDescription"),
      color: "error",
    });
  } finally {
    avatarUploading.value = false;
  }
};
</script>
