<template>
  <header class="mb-10">
    <UContainer>
      <div class="flex flex-col sm:flex-row py-8 gap-4 items-center">
        <div class="hidden sm:block basis-1/4" />
        <NuxtLink
          href="/"
          class="text-2xl sm:text-3xl font-bold basis-1/2 text-center hover:text-primary-500 transition-colors"
          >Reason App</NuxtLink
        >
        <div
          class="basis-1/4 flex gap-4 sm:gap-8 justify-center sm:justify-end items-center"
        >
          <USelectMenu v-model="locale" :options="languages" class="w-24" />
          <UButton v-if="!user" to="login" class="whitespace-nowrap">{{
            t("account.login")
          }}</UButton>
          <div v-else class="flex gap-4 sm:gap-8">
            <UButton
              color="error"
              @click="onLogout"
              class="whitespace-nowrap"
              >{{ t("account.logout") }}</UButton
            >
            <UButton
              icon="i-heroicons-user-20-solid"
              label="Account"
              to="/account"
              class="hidden sm:flex"
            />
          </div>
        </div>
      </div>
      <USeparator>
        <ClientOnly>
          <UButton
            :icon="
              isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'
            "
            color="neutral"
            variant="ghost"
            aria-label="Theme"
            @click="isDark = !isDark"
            class="hover:bg-gray-100 dark:hover:bg-gray-800"
          />

          <template #fallback>
            <div class="w-8 h-8" />
          </template>
        </ClientOnly>
      </USeparator>
    </UContainer>
  </header>
</template>
<script setup lang="ts">
const { locale, t } = useI18n();
const colorMode = useColorMode();

const { logout, fetchUser } = useStrapiAuth();

const user = await fetchUser();

const languages = ref(["de", "en"]);

const isDark = computed({
  get() {
    return colorMode.value === "dark";
  },
  set() {
    colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
  },
});

const onLogout = async () => {
  try {
    logout();

    await navigateTo("/");
  } catch (e) {}
};
</script>
