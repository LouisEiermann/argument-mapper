<template>
  <UContainer class="py-10">
    <div class="mx-auto w-full max-w-md">
      <UCard>
        <template #header>
          <div class="flex items-center gap-4">
            <img
              src="/brand/logosmap-icon.svg"
              alt="LogosMap"
              class="h-11 w-11"
            />
            <div>
              <h1 class="text-2xl font-semibold tracking-tight">
                {{ $t("account.register") }}
              </h1>
              <p class="mt-1 text-sm text-(--ui-text-muted)">
                {{ $t("account.registerDescription") }}
              </p>
            </div>
          </div>
        </template>

        <form class="space-y-4" @submit.prevent="onSubmit">
          <UFormField
            :label="$t('account.username')"
            name="username"
            :error="usernameTooShort ? $t('account.changeUsernameHelp') : undefined"
          >
            <UInput
              v-model="username"
              autocomplete="username"
              icon="i-heroicons-user"
              :placeholder="$t('account.username')"
            />
          </UFormField>

          <UFormField :label="$t('account.email')" name="email">
            <UInput
              v-model="email"
              type="email"
              autocomplete="email"
              icon="i-heroicons-envelope"
              :placeholder="$t('account.email')"
            />
          </UFormField>

          <UFormField :label="$t('account.password')" name="password">
            <UInput
              v-model="password"
              type="password"
              autocomplete="new-password"
              icon="i-heroicons-lock-closed"
              :placeholder="$t('account.password')"
            />
          </UFormField>

          <UFormField
            :label="$t('account.passwordConfirm')"
            name="passwordConfirm"
            :error="passwordMismatch ? $t('account.passwordMismatch') : undefined"
          >
            <UInput
              v-model="passwordConfirm"
              type="password"
              autocomplete="new-password"
              icon="i-heroicons-lock-closed"
              :placeholder="$t('account.passwordConfirm')"
            />
          </UFormField>

          <div class="space-y-3">
            <UCheckbox v-model="acceptedPrivacyPolicy" :label="$t('legal.privacyPolicy')" />
            <p class="text-sm text-(--ui-text-muted)">{{ $t("legal.disclaimer") }}</p>
          </div>

          <UButton
            block
            size="lg"
            :loading="loading"
            :disabled="!canSubmit || loading"
            type="submit"
          >
            {{ $t("account.register") }}
          </UButton>

          <p class="text-sm text-(--ui-text-muted)">
            <ULink to="/login" class="font-medium">
              {{ $t("account.haveAccount") }}
            </ULink>
          </p>
        </form>
      </UCard>
    </div>
  </UContainer>
</template>
<script setup lang="ts">
import { getApiErrorI18nKey } from "~/composables/useApiErrorMessage";

const { register } = useStrapiAuth();
const toast = useToast();
const { t } = useI18n();
const { public: publicConfig } = useRuntimeConfig();
const appMode = computed(() => (publicConfig.appMode || "private").toString());

const username = ref("");
const email = ref("");
const password = ref("");
const passwordConfirm = ref("");
const acceptedPrivacyPolicy = ref(false);
const loading = ref(false);

const usernameTooShort = computed(() => {
  if (!username.value) return false;
  return username.value.trim().length > 0 && username.value.trim().length < 3;
});

const passwordMismatch = computed(() => {
  if (!passwordConfirm.value) return false;
  return password.value !== passwordConfirm.value;
});

const canSubmit = computed(() => {
  return (
    username.value.trim().length >= 3 &&
    email.value.trim().length > 0 &&
    password.value.trim().length > 0 &&
    !passwordMismatch.value &&
    acceptedPrivacyPolicy.value
  );
});

const onSubmit = async () => {
  if (!canSubmit.value) return;
  loading.value = true;
  try {
    await register({
      username: username.value,
      email: email.value,
      password: password.value,
    });
    await navigateTo(appMode.value === "private" ? "/account" : "/feed");
  } catch (error) {
    console.log(error);
    toast.add({ title: t(getApiErrorI18nKey(error)), color: "error" });
  } finally {
    loading.value = false;
  }
};
</script>
