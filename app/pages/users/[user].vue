<template>
	<UContainer>
		<h1 class="text-center mt-8">
			{{ data?.user.username }}
		</h1>
		<p v-if="data?.user">
			Beigetreten: {{ formatDate(data.user.createdAt, locale) }}
		</p>
	</UContainer>
	<UContainer>
		<UAvatar
			v-if="data?.user.avatar"
			:src="useStrapiMedia(data.user.avatar.url)"
			:alt="data.user.username"
			size="3xl"
		/>
	</UContainer>
	<div class="grid-container">
		<UCard
			v-for="standpoint in data?.user.created.filter((e) => {
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
				<div class="header">
					<h1>Neue Debatte</h1>
					<UButton
						color="gray"
						variant="ghost"
						icon="i-heroicons-x-mark-20-solid"
						class="-my-1"
						@click="isModalOpen = false"
					/>
				</div>
			</template>
			Titel:
			<UInput type="text" v-model="title" />
			Prämisse:
			<UInput type="text" v-model="premise" />
			Begründung 1
			<UInput type="text" v-model="node1" />
			Begründung 2
			<UInput type="text" v-model="node2" />
			<USelectMenu
				:options="data?.availableTags"
				multiple
				v-model="selectedTags"
				placeholder="Tags auswählen"
				value-attribute="id"
				option-attribute="name"
			>
				<UButton label="Tags" trailing-icon="i-heroicons-chevron-down-20-solid"
			/></USelectMenu>
			<UButton @click="onChallenge">Herausfordern</UButton>
		</UCard>
	</UModal>
	<UButton @click="isModalOpen = true">Herausfordern</UButton>
</template>
<script setup lang="ts">
	definePageMeta({
		middleware: "auth",
	});

	const { find, findOne, create, update } = useStrapi();
	const { params } = useRoute();
	const { fetchUser } = useStrapiAuth();
	const { formatDate } = useDateFormatter();

	const isModalOpen = ref();
	const title = ref();
	const premise = ref();
	const node1 = ref();
	const node2 = ref();
	const selectedTags = ref([]);
	const { locale } = useI18n();
	const response = ref();

	const { data } = useAsyncData("data", async () => {
		const availableTags = (await find("tags", {})).data.map((e) => {
			return { id: e.id, name: e.attributes.name };
		});

		const user = await findOne("users", params.user, {
			populate: ["friends", "created", "isOpponent", "avatar"],
		});

		const ownUser = await fetchUser();

		return { availableTags, ownUser, user };
	});

	const onChallenge = async () => {
		const thesis = (
			await create("nodes", {
				Title: premise.value,
				Thesis: true,
				owner: ownUser.value?.id,
			})
		).data;

		const newReasonId = await create("nodes", {
			Title: node1.value,
			parent: thesis.id,
			owner: ownUser.value?.id,
		});
		const newReason2Id = await create("nodes", {
			Title: node2.value,
			parent: thesis.id,
			owner: ownUser.value?.id,
		});

		response.value = { newReasonId: newReasonId, newReason2Id: newReason2Id };

		await update("nodes", response.value.newReasonId.data.id, {
			siblings: [response.value.newReason2Id.data.id],
		});
		await update("nodes", response.value.newReason2Id.data.id, {
			siblings: [response.value.newReasonId.data.id],
		});

		await create("argument-trees", {
			title: title.value,
			nodes: thesis.id,
			creator: ownUser.value?.id,
			opponent: user.id,
			tags: selectedTags.value,
		});

		isModalOpen.value = false;
	};
</script>
<style lang="scss" scoped>
	.header {
		display: flex;
		justify-content: space-between;
	}
</style>
