<template>
  <div class="flex gap-8 mt-8">
    <UCard>
      <template #header>
        <h1>{{ $t("account.register") }}</h1>
      </template>

      <div class="space-y-6">
        <UInput v-model="username" :placeholder="$t('account.username')" />
        <UInput v-model="email" :placeholder="$t('account.email')" />
        <UInput v-model="password" :placeholder="$t('account.password')" />
        <UInput
          v-model="passwordConfirm"
          :placeholder="$t('account.passwordConfirm')"
        />
      </div>

      <template #footer>
        <div class="flex flex-col gap-6 py-2">
          <UCheckbox
            label="Ich habe die Datenschutzbestimmungen zur Kenntnis genommen. "
          />
          <p>Disclaimer</p>
          <UButton
            size="xl"
            class="w-fit"
            :disabled="!email || !password || !passwordConfirm"
            type="submit"
            @click="onSubmit"
            >{{ $t("account.register") }}</UButton
          >
        </div>
      </template>
    </UCard>
  </div>
</template>
<script setup lang="ts">
const { register } = useStrapiAuth();

const username = ref();
const email = ref();
const password = ref();
const passwordConfirm = ref();

const onSubmit = async () => {
  try {
    await register({
      username: username.value,
      email: email.value,
      password: password.value,
    });

    await navigateTo("/account");
  } catch (e) {
    console.log(e);
  }
};
</script>
