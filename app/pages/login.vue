<template>
  <div class="flex gap-8 mt-8">
    <UCard>
      <template #header>
        <h1>{{ $t("account.login") }}</h1>
      </template>

      <div class="space-y-6">
        <UButton @click="signIn('github', { callbackUrl: '/account' })"
          >Github</UButton
        >
        <USeparator :label="$t('account.or')" />
        <UInput v-model="email" :placeholder="$t('account.email')" />
        <UInput v-model="password" :placeholder="$t('account.password')" />
      </div>

      <template #footer>
        <div class="flex flex-col gap-6 py-2">
          <UButton size="xl" class="w-fit" @click="onSubmit()">
            {{ $t("account.login") }}
          </UButton>
          <UButton size="xl" class="w-fit">
            {{ $t("account.passwordForgotten") }}
          </UButton>
        </div>
        <NuxtLink to="/register">{{ $t("account.noAccount") }}</NuxtLink>
      </template>
    </UCard>
  </div>
</template>
<script setup lang="ts">
const { login } = useStrapiAuth();
const toast = useToast();
const { t } = useI18n();

const email = ref();
const password = ref();

const onSubmit = async () => {
  try {
    await login({
      identifier: email.value,
      password: password.value,
    });
    await navigateTo("/feed");
  } catch (error) {
    console.log(error);
    toast.add({ title: t("notification.loginFailed"), color: "error" });
  }
};
</script>
