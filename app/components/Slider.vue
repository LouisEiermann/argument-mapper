<template>
	<UCarousel
		v-slot="{ item, index }"
		:items="sliderItems"
		:ui="{ item: 'basis-full' }"
		arrows
		indicators
	>
		<div class="text-center mx-auto">
			<div class="node" v-if="item.items">
				<UCard
					v-for="node of item.items"
					class="node-content"
					@click="isSlideroverOpen = true"
					:class="{
						'soundness-doubted': node.SoundnessDoubted,
						'not-valid': isNotValid,
					}"
				>
					<UButton
						v-if="node.owner.id === ownUser?.id && !node.Thesis"
						class="delete-button"
						@click="deleteReason(node.id)"
						icon="i-heroicons-x-circle-20-solid"
						color="red"
					></UButton>

					<p>{{ node.Title }}</p>

					<UButton
						class="move-down"
						@click="descendLevel(node.id)"
						icon="i-heroicons-arrow-down-16-solid"
					/>
				</UCard>
			</div>
		</div>
	</UCarousel>
</template>
<script setup lang="ts">
	const props = defineProps([
		"sliderItems",
		"userIsCreator",
		"isUnilateral",
		"isNotValid",
	]);

	const { create, delete: deleteNode, update } = useStrapi();
	const isOpen = ref(false);
	const isSlideroverOpen = ref(false);
	const newReason = ref({ title: "" });
	const newReason2 = ref({ title: "" });
	const currentDropdownNode = ref();
	const toast = useToast();
	const { t } = useI18n();
	const response = ref();
	const route = useRoute();
	const currentLevel = ref(route.params.level || 1);
	const { fetchUser } = useStrapiAuth();
	const ownUser = await fetchUser();

	const refresh = inject("refresh");

	const addReasons = async (parentId: any) => {
		const newReasonId = await create("nodes", {
			Title: newReason.value.title,
			parent: parentId,
		});
		const newReason2Id = await create("nodes", {
			Title: newReason2.value.title,
			parent: parentId,
		});
		response.value = { newReasonId: newReasonId, newReason2Id: newReason2Id };

		await update("nodes", response.value.newReasonId.data.id, {
			siblings: [response.value.newReason2Id.data.id],
		});
		await update("nodes", response.value.newReason2Id.data.id, {
			siblings: [response.value.newReasonId.data.id],
		});

		refresh();
		isOpen.value = false;
	};

	const deleteReason = async (id: string) => {
		await deleteNode("nodes", id);
		refresh();
	};

	const markAsNotSound = async (id: string) => {
		await update("nodes", id, { SoundnessDoubted: true });
		refresh();
	};

	const markAsSound = async (id: string) => {
		await update("nodes", id, { SoundnessDoubted: false });
		refresh();
	};

	const markAsValidAgain = async () => {
		await update("nodes", props.parent.id, {
			FormalFellacyBelow: "",
		});
		refresh();
	};

	const save = async (id: string) => {
		await update("nodes", id, props.node);
		toast.add({ title: t("notification.saved") });
		refresh();
	};

	const descendLevel = async (id: string) => {
		navigateTo({
			path: "",
			query: {
				level: id,
			},
		});
	};

	function groupItemsBySiblings(items) {
		// Map to track visited nodes
		const visited = new Set();
		// Array to hold the final groups
		const groups = [];

		// Create a map for quick lookup of nodes by their ID
		const nodesById = new Map(items.map((item) => [item.id, item]));

		// Helper function to add items to the group
		function addGroup(item) {
			const group = new Set();
			const queue = [item];

			while (queue.length > 0) {
				const current = queue.shift();
				if (!visited.has(current.id)) {
					visited.add(current.id);
					group.add(current);

					// Enqueue siblings
					current.siblings.forEach((sibling) => {
						if (!visited.has(sibling.id)) {
							const siblingItem = nodesById.get(sibling.id);
							if (siblingItem) {
								queue.push(siblingItem);
							}
						}
					});
				}
			}

			if (group.size > 0) {
				groups.push({ items: Array.from(group) });
			}
		}

		// Iterate over each item and add to the groups if not visited
		items.forEach((item) => {
			if (!visited.has(item.id)) {
				addGroup(item);
			}
		});

		return groups;
	}

	// Usage in Vue component
	const itemsGroupedByCoPremises = computed(() => {
		return groupItemsBySiblings(props.node.children);
	});

	const formalFallacies = [
		[
			{
				label: "Affirming the Consequent",
				click: async () => {
					await update("nodes", currentDropdownNode.value, {
						FormalFellacyBelow: "Affirming the Consequent",
					});
					refresh();
				},
			},
			{
				label: "Denying the Antecedent",
				click: async () => {
					await update("nodes", currentDropdownNode.value, {
						FormalFellacyBelow: "Denying the Antecedent",
					});
					refresh();
				},
			},
		],
		[
			{
				label:
					"Affirmative Conclusion from a Negative Premise (Illicit Negative)",
				click: async () => {
					await update("nodes", currentDropdownNode.value, {
						FormalFellacyBelow:
							"Affirmative Conclusion from a Negative Premise (Illicit Negative)",
					});
					refresh();
				},
			},
			{
				label:
					"Negative Conclusion from Affirmative Premises (Illicit Affirmative)",
				click: async () => {
					await update("nodes", currentDropdownNode.value, {
						FormalFellacyBelow:
							"Negative Conclusion from Affirmative Premises (Illicit Affirmative)",
					});
					refresh();
				},
			},
		],
		[
			{
				label: "Undistributed Middle",
				click: async () => {
					await update("nodes", currentDropdownNode.value, {
						FormalFellacyBelow: "Undistributed Middle",
					});
					refresh();
				},
			},
			{
				label: "Illicit Major",
				click: async () => {
					await update("nodes", currentDropdownNode.value, {
						FormalFellacyBelow: "Illicit Major",
					});
					refresh();
				},
			},
			{
				label: "Illicit Minor",
				click: async () => {
					await update("nodes", currentDropdownNode.value, {
						FormalFellacyBelow: "Illicit Minor",
					});
					refresh();
				},
			},
		],
		[
			{
				label:
					"Fallacy of Exclusive Premises (Drawing an Affirmative Conclusion from Negative Premises)",
				click: async () => {
					await update("nodes", currentDropdownNode.value, {
						FormalFellacyBelow:
							"Fallacy of Exclusive Premises (Drawing an Affirmative Conclusion from Negative Premises)",
					});
					refresh();
				},
			},
			{
				label: "Existential Fallacy",
				click: async () => {
					await update("nodes", currentDropdownNode.value, {
						FormalFellacyBelow: "Existential Fallacy",
					});
					refresh();
				},
			},
		],
		[
			{
				label: "Fallacy of Four Terms (Quaternio Terminorum)",
				click: async () => {
					await update("nodes", currentDropdownNode.value, {
						FormalFellacyBelow: "Fallacy of Four Terms (Quaternio Terminorum)",
					});
					refresh();
				},
			},
			{
				label: "Fallacy of the Undistributed Middle (Infima Species)",
				click: async () => {
					await update("nodes", currentDropdownNode.value, {
						FormalFellacyBelow:
							"Fallacy of the Undistributed Middle (Infima Species)",
					});
					refresh();
				},
			},
			{
				label:
					"Fallacy of Illicit Process (Fallacy of the Illicit Major/Minor Term)",
				click: async () => {
					await update("nodes", currentDropdownNode.value, {
						FormalFellacyBelow:
							"Fallacy of Illicit Process (Fallacy of the Illicit Major/Minor Term)",
					});
					refresh();
				},
			},
		],
		[
			{
				label: "Modal Fallacy",
				click: async () => {
					await update("nodes", currentDropdownNode.value, {
						FormalFellacyBelow: "Modal Fallacy",
					});
					refresh();
				},
			},
		],
	];
</script>
<style lang="scss" scoped>
	.node {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 2rem;

		&-content {
			position: relative;
			min-width: 150px;
			width: 300px;
			height: 200px;
		}
	}

	.text-center {
		height: 200px;
	}

	.delete-button {
		position: absolute;
		top: -1rem;
		right: 1rem;
	}

	.move-down {
		position: absolute;
		top: 12rem;
	}
</style>
