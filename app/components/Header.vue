<template>
  <UHeader to="/" v-model:open="isMenuOpen" :toggle="false">
    <template #title>
      <span
        class="text-2xl sm:text-3xl font-bold text-center sm:text-left hover:text-primary-500 transition-colors"
      >
        Reason App
      </span>
    </template>

    <UNavigationMenu :items="items" class="hidden sm:flex" />

    <template #right>
      <div class="flex gap-4 sm:gap-8 items-center">
        <ULocaleSelect
          :model-value="locale"
          :locales="[en, de]"
          @update:model-value="onLocaleChange"
        />

        <UButton
          v-if="!user"
          to="login"
          class="whitespace-nowrap hidden sm:inline-flex"
        >
          {{ t("account.login") }}
        </UButton>
        <div v-else class="flex gap-4 sm:gap-8 hidden sm:flex">
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

        <UButton
          icon="i-heroicons-bars-3-20-solid"
          color="neutral"
          variant="ghost"
          class="sm:hidden"
          @click="isMenuOpen = !isMenuOpen"
        />
      </div>
    </template>

    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />
      <USeparator class="my-4" />
      <div class="flex flex-col gap-2">
        
        <UButton
          v-if="!user"
          to="login"
          class="justify-start"
          color="neutral"
          variant="ghost"
        >
          {{ $t("account.login") }}
        </UButton>
        <template v-else>
          <UButton
            to="/account"
            class="justify-start"
            color="neutral"
            variant="ghost"
            icon="i-heroicons-user-20-solid"
          >
            Account
          </UButton>
          <UButton
            color="error"
            variant="ghost"
            @click="onLogout"
            class="justify-start"
          >
            {{ $t("account.logout") }}
          </UButton>
        </template>
      </div>
    </template>
  </UHeader>
</template>
<script setup lang="ts">
import { en, de } from '@nuxt/ui/locale'

const colorMode = useColorMode();

const { t, setLocale, locale } = useI18n();
const { logout } = useStrapiAuth();

const user = useStrapiUser();

const isMenuOpen = ref(false);

const items = [
  {
    label: "Docs",
    to: "/docs",
    icon: "i-heroicons-book-open",
  },
];

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

const onLocaleChange = async (code: string) => {
  await setLocale(code);
};
</script>
