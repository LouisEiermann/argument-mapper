<template>
	<UCard v-for="topic of data?.topics.data" class="m-4">
		<NuxtLink :to="'learn/' + topic.id">{{ topic.attributes.name }}</NuxtLink>
		<template #footer>
			<UProgress :value="0" indicator />
		</template>
	</UCard>
</template>
<script setup lang="ts">
	definePageMeta({
		middleware: "auth",
	});

	const { find } = useStrapi();
	const { fetchUser } = useStrapiAuth();
	const user = await fetchUser();

	const { data } = useAsyncData("data", async () => {
		const topics = await find("topics", {});

		return {
			topics,
		};
	});
</script>
