<template>
	<UContainer v-if="data?.user">
		<h1 class="text-center mt-8">
			{{ data?.user.username }}
		</h1>
		<p v-if="data?.user">
			Beigetreten: {{ formatDate(data.user.createdAt, locale) }}
		</p>
	</UContainer>
	<UContainer v-if="data?.user">
		<UAvatar
			v-if="data?.user.avatar"
			:src="useStrapiMedia(data.user.avatar.url)"
			:alt="data.user.username"
			size="3xl"
		/>
	</UContainer>
	<div class="grid-container" v-if="data?.user && data?.user.created">
		<UCard
			v-for="standpoint in data?.user.created.filter((e) => {
				return !e.opponentAccepted;
			})"
			class="grid-item"
		>
			{{ standpoint.id }}
			<UButton :to="'/argument/' + standpoint.id">Zum Standpunkt</UButton>
		</UCard>
	</div>
	<NewArgumentModal
		:is-open="isModalOpen"
		@refresh="refresh()"
		@update:isOpen="isModalOpen = $event"
		:is-debate="true"
		:other-user="data?.user"
	/>
	<UButton @click="isModalOpen = true">Herausfordern</UButton>
</template>
<script setup lang="ts">
	definePageMeta({
		middleware: "auth",
	});

	const { findOne } = useStrapi();
	const { params } = useRoute();
	const { fetchUser } = useStrapiAuth();
	const { formatDate } = useDateFormatter();

	const isModalOpen = ref();
	const { locale } = useI18n();

	const { data, refresh } = useAsyncData("data", async () => {
		const user = await findOne("users", params.user, {
			populate: ["friends", "created", "isOpponent", "avatar"],
		});

		const ownUser = await fetchUser();

		return { ownUser, user };
	});
</script>
<style lang="scss" scoped>
	.header {
		display: flex;
		justify-content: space-between;
	}
</style>
