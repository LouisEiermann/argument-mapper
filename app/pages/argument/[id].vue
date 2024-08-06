<template>
	<div class="argument-container">
		<div class="overview">
			<div class="overview-description">
				<div class="image-container">
					<img
						class="rounded-md"
						:src="
							'http://localhost:1337' +
							response.data[0].attributes.tags.data[0].attributes.defaultMood
								.data.attributes.url
						"
					/>
					<div class="tags">
						<UBadge v-for="tag of response.data[0].attributes.tags.data">{{
							tag.attributes.name
						}}</UBadge>
					</div>
				</div>
				<UCard>
					<template #header
						><h1 class="rounded-md">{{ response.data[0].attributes.title }}</h1>
					</template>
					<p>
						{{ response.data[0].attributes.description }}
					</p>
					<template #footer
						><UButton class="move-down" @click="isOpen = true"
							>Einstellungen</UButton
						>
						<UButton
							class="end-argument"
							color="red"
							v-if="userIsCreator || !response.data[0].attributes.isUnilateral"
							@click="onArgumentDelete"
							>Argument beenden</UButton
						>
					</template>
				</UCard>
				<UModal v-model="isOpen">
					<template #header>
						<div class="header">
							<h1>Neue Überzeugung</h1>
							<UButton
								color="gray"
								variant="ghost"
								icon="i-heroicons-x-mark-20-solid"
								class="-my-1"
								@click="isOpen = false"
							/>
						</div>
					</template>

					<input type="file" @change="handleFileChange" />
				</UModal>
			</div>
			<UProgress :value="70" />
		</div>
		<Tree
			:node="findNodeByIdAtLevel(data, currentLevel) || data"
			v-if="data"
			:user-is-creator="userIsCreator"
			:is-unilateral="
				findNodeByIdAtLevel(data.children, currentLevel) ||
				response.data[0].attributes.isUnilateral
			"
			:parent="
				findNodeByIdAtLevel(data.children, currentLevel) ||
				response.data[0].attributes.parent
			"
			:whole-tree="data"
		/>
	</div>
</template>
<script setup lang="ts">
	const { find, delete: deleteArgument } = useStrapi();
	const { params } = useRoute();
	const { fetchUser } = useStrapiAuth();
	const client = useStrapiClient();
	const user = await fetchUser();
	const toast = useToast();
	const { t } = useI18n();
	const route = useRoute();
	const currentLevel = computed(() => Number(route.query.level) || 1);
	const isOpen = ref(false);

	const response = await find("argument-trees", {
		populate: {
			nodes: true,
			creator: true,
			opponent: true,
			isUnilateral: true,
			tags: {
				populate: ["defaultMood"],
			},
		},
		filters: {
			id: {
				$eq: params.id,
			},
		},
	});

	const userIsCreator = computed(() => {
		return user.value?.id === response.data[0].attributes.creator.data.id;
	});

	const { data, refresh } = await useAsyncData("data", () =>
		$fetch(
			`http://localhost:1337/api/node-tree?id=${response.data[0].attributes.nodes.data[0].id}`
		)
	);

	provide("refresh", refresh);

	const handleFileChange = async (event) => {
		const formData = new FormData();

		formData.append("files", event.target.files[0]);
		formData.append("ref", "api::argument-tree.argument-tree");
		formData.append("refId", params.id);
		formData.append("field", "mood");

		await client("/upload", {
			method: "POST",
			body: formData,
		});
		refresh();
	};

	const onArgumentDelete = async (event) => {
		await deleteArgument("argument-trees", response.data[0].id);
		await navigateTo("/account");
		toast.add({ title: t("notification.argumentDeleted") });
	};

	function findNodeByIdAtLevel(node, targetId) {
		if (node.id === targetId) {
			return node;
		}

		if (!node.children || node.children.length === 0) {
			return null;
		}

		for (let child of node.children) {
			const found = findNodeByIdAtLevel(child, targetId);
			if (found) {
				return found;
			}
		}

		return null;
	}
</script>
<style lang="scss" scoped>
	.image-container {
		position: relative;
	}
	.tags {
		position: absolute;
		bottom: 0.5rem;
		left: 0.5rem;

		& > * {
			margin: 0.2rem;
		}
	}
	.argument-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		position: relative;
		margin-top: 4rem;

		h1 {
			top: 12rem;
			font-size: 1.5rem;
			background-color: #fff;
			padding: 0.2rem;
		}

		img {
			width: 300px;
		}
	}

	.overview {
		display: flex;
		flex-direction: column;
		gap: 1rem;

		&-description {
			display: flex;
			gap: 1rem;
		}
	}
	.end-argument {
		width: fit-content;
	}

	.header {
		display: flex;
		justify-content: space-between;
	}
</style>
