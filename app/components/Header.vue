<template>
	<header class="mb-10">
		<UContainer>
			<div class="flex py-8 gap-4">
				<div class="basis-1/4"></div>
				<NuxtLink href="/" class="text-2xl basis-1/2 text-center"
					>Reason App</NuxtLink
				>
				<div class="basis-1/4 flex gap-8 justify-end">
					<USelectMenu v-model="locale" :options="languages" />
					<UButton v-if="!user" to="login">{{ $t("account.login") }}</UButton>
					<div v-else class="flex gap-8">
						<UButton @click="onLogout">{{ $t("account.logout") }}</UButton>
						<UButton
							icon="i-heroicons-user-20-solid"
							label="Account"
							to="/account"
						/>
					</div>
				</div>
			</div>
			<UDivider>
				<ClientOnly>
					<UButton
						:icon="
							isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'
						"
						color="gray"
						variant="ghost"
						aria-label="Theme"
						@click="isDark = !isDark"
					/>

					<template #fallback>
						<div class="w-8 h-8" />
					</template>
				</ClientOnly>
			</UDivider>
		</UContainer>
	</header>
</template>
<script setup lang="ts">
	const { locale } = useI18n();
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
