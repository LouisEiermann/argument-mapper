<template>
	<div v-if="user && data.length > 0" class="feed">
		<div ref="el">
			<UCard v-for="item in data">
				<template #header>
					<div class="header">
						<UAvatar /> vs <UAvatar />
						<p>{{ item.attributes.title }}</p>
						<p>{{ timeSincePosted(item.attributes.createdAt) }}</p>
					</div>
				</template>
				{{ item.description }}
				<template #footer>
					<div class="footer">
						<UProgress
							:value="
								useVoteCalculator(item.attributes.votes).creatorPercentage
							"
						/>
						<div>
							<div>{{ item.attributes.votes.data }}</div>
							<div>{{ item }}</div>
						</div>
						<div>
							<UButton :to="'/argument/' + item.id">Zum Argument</UButton>
							<div>Teilen</div>
						</div>
					</div>
				</template>
			</UCard>
		</div>
		<UButton @click="resetList()" class="refresh">Refresh</UButton>
	</div>
</template>
<script setup lang="ts">
	definePageMeta({
		middleware: "auth",
	});

	import { useInfiniteScroll } from "@vueuse/core";

	const user = useStrapiUser();
	const { find } = useStrapi();
	const route = useRoute();

	const el = ref<HTMLElement | null>(null);
	const data = ref<any[]>([]);
	const hasMoreData = ref(true);
	const currentPage = ref(1);
	const itemsPerPage = ref(10);
	const { timeSincePosted } = useDateFormatter();

	const fetchData = async (page: number, pageSize: number) => {
		const response = await find("argument-trees", {
			pagination: { page, pageSize },
			filters: {
				opponentAccepted: {
					$eq: true,
				},
			},
			populate: ["votes"],
		});
		return response.data;
	};

	const loadMoreData = async () => {
		if (!hasMoreData.value) return;

		const moreData = await fetchData(currentPage.value, itemsPerPage.value);
		if (moreData.length === 0) {
			hasMoreData.value = false;
		} else {
			data.value.push(...moreData);
			currentPage.value += 1;
		}
	};

	const fetchInitialData = async () => {
		data.value = await fetchData(1, itemsPerPage.value);
		currentPage.value = 2;
	};

	const { reset } = useInfiniteScroll(el, loadMoreData, { distance: 10 });

	const { data: asyncData, refresh } = useAsyncData(
		"argument-trees",
		async () => {
			if (data.value.length === 0) {
				await fetchInitialData();
			}
			return data;
		}
	);

	function resetList() {
		data.value = [];
		hasMoreData.value = true;
		currentPage.value = 1;
		fetchInitialData();
	}

	onMounted(() => {
		fetchInitialData();
	});

	watchEffect(() => {
		if (route.fullPath) {
			resetList(); // Reset and fetch data on route change
		}
	});
</script>
<style lang="scss" scoped>
	.feed {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		margin-top: 1rem;

		.argument {
			display: flex;
		}
	}
	.refresh {
		margin-top: 2rem;
	}

	.header {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.footer {
		display: flex;
		flex-direction: column;
		gap: 1rem;

		div {
			display: flex;
			justify-content: space-between;
		}
	}
</style>
