<template>
	<div class="tree-node">
		<Minimap :nodes="wholeTree" />
	</div>
	<div class="tree-node">
		<UCard
			class="node-content"
			@click="isSlideroverOpen = true"
			:class="{
				'soundness-doubted': node.SoundnessDoubted,
				'not-valid': isNotValid,
			}"
		>
			<UButton
				v-if="node.owner?.id === ownUser?.id && !node.Thesis"
				class="delete-button"
				@click="deleteReason(node?.id)"
				icon="i-heroicons-x-circle-20-solid"
				color="red"
			></UButton>
			<UButton
				v-if="node.parent"
				class="move-up"
				@click.stop="ascendLevel(node.parent?.id)"
				icon="i-heroicons-arrow-up-16-solid"
			></UButton>
			<div v-if="node.Thesis" class="badge">Thesis</div>
			<div v-if="node.Axiom" class="badge">Axiom</div>
			<p>{{ node.Title }}</p>
		</UCard>
		<UButton
			v-if="userIsCreator"
			class="add-button"
			@click="isOpen = true"
			icon="i-heroicons-plus-circle-16-solid"
		/>
		<UDropdown
			v-if="
				node.children?.length > 0 && !userIsCreator && !node.FormalFellacyBelow
			"
			color="yellow"
			:items="formalFallacies"
			:popper="{ placement: 'bottom-start' }"
			@click="currentDropdownNode = node?.id"
		>
			<UButton
				color="yellow"
				label="Doubt Validity"
				trailing-icon="i-heroicons-chevron-down-20-solid"
			/>
		</UDropdown>
		<UButton
			v-else-if="
				!userIsCreator &&
				node.children.length === 0 &&
				node.parent.FormalFellacyBelow
			"
			@click="markAsValidAgain"
			color="purple"
			>Mark as valid again
		</UButton>
		<UButton
			v-if="
				!userIsCreator && node.children.length === 0 && !node.SoundnessDoubted
			"
			@click="markAsNotSound(node?.id)"
			color="purple"
			>Doubt Soundness
		</UButton>
		<UButton
			v-else-if="!userIsCreator && node.children.length === 0"
			@click="markAsSound(node?.id)"
			color="purple"
			>Mark as Sound again
		</UButton>
		<UButton
			v-if="node.owner?.id !== ownUser?.id"
			color="red"
			@click="(isOpen = true), (isObjection = true)"
			>Objection</UButton
		>
		<UModal v-model="isOpen">
			<UCard
				:ui="{
					ring: '',
					divide: 'divide-y divide-gray-100 dark:divide-gray-800',
				}"
			>
				<template #header>
					<div class="header">
						<h1 v-if="!isObjection">Grund hinzufügen</h1>
						<h1 v-else>Gegenargument hinzufügen</h1>
						<UButton
							color="gray"
							variant="ghost"
							icon="i-heroicons-x-mark-20-solid"
							class="-my-1"
							@click="isOpen = false"
						/>
					</div>
				</template>

				<div class="space-y-6">
					<UInput v-model="newReason.title" />
					<UInput v-model="newReason2.title" />
				</div>

				<template #footer>
					<UButton v-if="!isObjection" @click="addReasons(node?.id, false)"
						>Add Reason</UButton
					>
					<UButton v-else @click="addReasons(node?.id, true)"
						>Add Objection</UButton
					></template
				>
			</UCard>
		</UModal>
		<div
			class="children"
			v-if="
				node.children &&
				node.children.length > 0 &&
				node.level <= currentLevel &&
				!end
			"
		>
			<Slider
				:slider-items="itemsGroupedByCoPremises"
				:is-not-valid="node.FormalFellacyBelow || isNotValid"
				:user-is-creator="userIsCreator"
				:is-unilateral="isUnilateral"
			/>
		</div>
	</div>
	<USlideover v-model="isSlideroverOpen">
		<div class="p-4 flex-1 scroll">
			<UTextarea v-model="node.Title" />
			<UDivider />
			Sources:
			<UDivider />
			<UButton @click="save(node.id)">Speichern</UButton>
			<UDivider />
			<Discussion :node="node" />
		</div>
	</USlideover>
</template>
<script setup lang="ts">
	const props = defineProps([
		"node",
		"isNotValid",
		"userIsCreator",
		"parent",
		"isUnilateral",
		"end",
		"wholeTree",
	]);

	const { create, delete: deleteStrapi, update } = useStrapi();
	const isOpen = ref(false);
	const isObjection = ref(false);
	const isSlideroverOpen = ref(false);
	const newReason = ref({ title: "" });
	const newReason2 = ref({ title: "" });
	const currentDropdownNode = ref();
	const toast = useToast();
	const { t } = useI18n();
	const response = ref();
	const route = useRoute();
	const currentLevel = computed(() => Number(route.query.level) || 1);
	const { fetchUser } = useStrapiAuth();
	const ownUser = await fetchUser();

	const addReasons = async (parentId: any, isObjection: boolean) => {
		if (!isObjection) {
			const newReasonId = await create("nodes", {
				Title: newReason.value.title,
				parent: parentId,
				owner: ownUser.value?.id,
			});
			const newReason2Id = await create("nodes", {
				Title: newReason2.value.title,
				parent: parentId,
				owner: ownUser.value?.id,
			});
			response.value = { newReasonId: newReasonId, newReason2Id: newReason2Id };

			await update("nodes", response.value.newReasonId.data.id, {
				siblings: [response.value.newReason2Id.data.id],
			});
			await update("nodes", response.value.newReason2Id.data.id, {
				siblings: [response.value.newReasonId.data.id],
			});
		} else {
			const newReasonId = await create("nodes", {
				Title: newReason.value.title,
				parent: parentId,
				owner: ownUser.value?.id,
			});
			const newReason2Id = await create("nodes", {
				Title: newReason2.value.title,
				parent: parentId,
				owner: ownUser.value?.id,
			});
			response.value = { newReasonId: newReasonId, newReason2Id: newReason2Id };

			await update("nodes", response.value.newReasonId.data.id, {
				siblings: [response.value.newReason2Id.data.id],
			});
			await update("nodes", response.value.newReason2Id.data.id, {
				siblings: [response.value.newReasonId.data.id],
			});
		}

		refresh();
		isOpen.value = false;
	};

	const deleteReason = async (id: string) => {
		await deleteStrapi("nodes", id);
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

	const ascendLevel = async (id: string) => {
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
	.tree-node {
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
		min-height: 368px;
		min-width: 664px;
		justify-content: center;
		margin: 2rem;
	}

	.children {
		display: flex;
		justify-content: center;
		position: relative;
	}

	.delete-button {
		position: absolute;
		top: -1rem;
		right: 1rem;
	}

	.add-button {
		position: absolute;
		top: 12rem;
	}

	.move-up {
		position: absolute;
		top: -1rem;
		left: 8.5rem;
	}

	.child-container {
		display: flex;
		align-items: flex-start;
		position: relative;
		margin-top: 20px;
	}

	.horizontal-container {
		display: flex;
	}

	.node-content {
		width: 300px;
		height: 200px;
		position: relative;
		margin-bottom: 2rem;
	}

	.child-container::before {
		content: "";
		position: absolute;
		top: -20px;
		left: 50%;
		width: 2px;
		height: 20px;
		background-color: #000;
		transform: translateX(-50%);
	}

	.soundness-doubted {
		box-shadow: 5px 5px 5px rgb(239, 68, 68);
	}

	.not-valid {
		opacity: 50%;
	}

	.header {
		display: flex;
		justify-content: space-between;
	}

	.scroll {
		overflow: scroll;
	}
</style>
