<template>
  <header class="mb-10">
    <UContainer>
      <div class="flex flex-col sm:flex-row py-8 gap-4 justify-between">
        <NuxtLink
          href="/"
          class="text-2xl sm:text-3xl font-bold text-center sm:text-left hover:text-primary-500 transition-colors"
        >
          Reason App
        </NuxtLink>
        <div
          class="flex gap-4 sm:gap-8 justify-center sm:justify-end items-center"
        >
          <UButton
            v-for="locale in locales"
            :key="locale.code"
            @click="setLocale(locale.code)"
          >
            {{ locale.name }}
          </UButton>
          <UButton v-if="!user" to="login" class="whitespace-nowrap">
            {{ t("account.login") }}
          </UButton>
          <div v-else class="flex gap-4 sm:gap-8">
            <UButton color="error" @click="onLogout" class="whitespace-nowrap">
              {{ t("account.logout") }}
            </UButton>
            <UButton
              icon="i-heroicons-user-20-solid"
              label="Account"
              to="/account"
              class="sm:flex"
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
const { locales, t, setLocale } = useI18n();
const colorMode = useColorMode();

const { logout } = useStrapiAuth();

const user = useStrapiUser();

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
