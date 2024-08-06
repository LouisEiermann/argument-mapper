<template>
	<UContainer>
		<h1 class="text-center mt-8">
			{{ user.username }}
		</h1>
		<p v-if="user">Beigetreten: {{ formatDate(user.createdAt, locale) }}</p>
	</UContainer>
	<UContainer>
		<UAvatar
			v-if="user.avatar"
			:src="useStrapiMedia(user.avatar.url)"
			:alt="user.username"
			size="3xl"
		/>
	</UContainer>
	<div class="grid-container">
		<UCard
			v-for="standpoint in user?.created.filter((e) => {
				return e.isUnilateral;
			})"
			class="grid-item"
		>
			{{ standpoint.id }}
			<UButton :to="'/argument/' + standpoint.id">Zum Standpunkt</UButton>
		</UCard>
	</div>
	<UModal v-model="isModalOpen">
		<UCard
			:ui="{
				ring: '',
				divide: 'divide-y divide-gray-100 dark:divide-gray-800',
			}"
		>
			<template #header>
				<h1>Neue Debatte</h1>
				<UButton
					color="gray"
					variant="ghost"
					icon="i-heroicons-x-mark-20-solid"
					class="-my-1"
					@click="isModalOpen = false"
				/>
			</template>
			Titel:
			<UInput type="text" v-model="title" />
			Prämisse:
			<UInput type="text" v-model="premise" />
			Begründung 1
			<UInput type="text" v-model="node1" />
			Begründung 2
			<UInput type="text" v-model="node2" />
			<UButton @click="onChallenge">Start</UButton>
		</UCard>
	</UModal>
	<UButton @click="isModalOpen = true">Herausfordern</UButton>
</template>
<script setup lang="ts">
	const { findOne, create } = useStrapi();
	const { params } = useRoute();
	const { fetchUser } = useStrapiAuth();
	const { formatDate } = useDateFormatter();

	const isModalOpen = ref();
	const title = ref();
	const premise = ref();
	const node1 = ref();
	const node2 = ref();
	const { locale } = useI18n();

	const user = await findOne("users", params.user, {
		populate: ["friends", "created", "isOpponent", "avatar"],
	});

	const ownUser = await fetchUser();

	const onChallenge = async () => {
		const thesis = (
			await create("nodes", {
				Title: premise.value,
				Thesis: true,
			})
		).data;

		await create("nodes", { Title: node1.value, parent: thesis.id });
		await create("nodes", { Title: node2.value, parent: thesis.id });

		await create("argument-trees", {
			title: title.value,
			nodes: thesis.id,
			creator: ownUser.value?.id,
			opponent: user.id,
		});

		isModalOpen.value = false;
	};
</script>
