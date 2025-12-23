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
                {{ $t("account.login") }}
              </h1>
              <p class="mt-1 text-sm text-(--ui-text-muted)">
                {{ $t("account.loginDescription") }}
              </p>
            </div>
          </div>
        </template>

        <form class="space-y-4" @submit.prevent="onSubmit">
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
              autocomplete="current-password"
              icon="i-heroicons-lock-closed"
              :placeholder="$t('account.password')"
            />
          </UFormField>

          <UButton
            block
            size="lg"
            :loading="loading"
            :disabled="!canSubmit || loading"
            type="submit"
          >
            {{ $t("account.login") }}
          </UButton>

          <p class="text-sm text-(--ui-text-muted)">
            <ULink to="/register" class="font-medium">
              {{ $t("account.noAccount") }}
            </ULink>
          </p>
        </form>
      </UCard>
    </div>
  </UContainer>
</template>
<script setup lang="ts">
import { getApiErrorI18nKey } from "~/composables/useApiErrorMessage";

const { login } = useStrapiAuth();
const toast = useToast();
const { t } = useI18n();
const { public: publicConfig } = useRuntimeConfig();
const appMode = computed(() => (publicConfig.appMode || "private").toString());

const email = ref("");
const password = ref("");
const loading = ref(false);

const canSubmit = computed(() => {
  return email.value.trim().length > 0 && password.value.trim().length > 0;
});

const onSubmit = async () => {
  if (!canSubmit.value) return;
  loading.value = true;
  try {
    await login({
      identifier: email.value,
      password: password.value,
    });
    const redirectCookie = useCookie<string | null>("redirect", { path: "/" });
    const target =
      redirectCookie.value && redirectCookie.value.startsWith("/")
        ? redirectCookie.value
        : appMode.value === "private"
          ? "/account"
          : "/feed";
    redirectCookie.value = null;
    await navigateTo(target);
  } catch (error) {
    console.log(error);
    toast.add({ title: t(getApiErrorI18nKey(error)), color: "error" });
  } finally {
    loading.value = false;
  }
};
</script>
