<template>
	<div class="tree-node">
		<Minimap :node="wholeTree" />
	</div>
	<div class="tree-node">
		<UCard
			class="node-content"
			@click="isSlideoverOpen = true"
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
			<p>{{ node.title }}</p>
		</UCard>
		<UButton
			v-if="node.owner?.id === ownUser?.id"
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
			@click="isOpen = true"
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
						<h1 v-if="node.owner.id === ownUser?.id">
							{{ $t("argument.support.add") }}
						</h1>
						<h1 v-else>{{ $t("argument.objection.add") }}</h1>
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
					<UInput
						type="text"
						v-model="premise"
						:placeholder="$t('argument.new.premise')"
					/>
					<UInput
						v-if="premise != ''"
						type="text"
						v-model="coPremise"
						:placeholder="$t('argument.new.coPremise')"
					/>
					<UInput
						v-if="coPremise != ''"
						type="text"
						v-model="secondCoPremise"
						:placeholder="$t('argument.new.secondCoPremise')"
					/>
				</div>

				<template #footer>
					<UButton @click="addReasons(node?.id)">{{
						$t("argument.new.add")
					}}</UButton>
				</template>
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
			/>
		</div>
	</div>
	<ArgumentSlideover
		:is-slideover-open="isSlideoverOpen"
		:node="node"
		:own-user="ownUser"
		@refresh="refresh()"
		@update:isOpen="isSlideoverOpen = $event"
	/>
</template>
<script setup lang="ts">
	const props = defineProps([
		"node",
		"isNotValid",
		"userIsCreator",
		"parent",
		"end",
		"wholeTree",
		"argument",
	]);

	const { create, delete: deleteStrapi, update } = useStrapi();
	const isOpen = ref(false);
	const isSlideoverOpen = ref(false);
	const currentDropdownNode = ref();
	const { t } = useI18n();
	const route = useRoute();
	const currentLevel = computed(() => Number(route.query.level) || 1);
	const { fetchUser } = useStrapiAuth();
	const ownUser = await fetchUser();
	const refresh = inject("refresh");

	const premise = ref("");
	const coPremise = ref("");
	const secondCoPremise = ref("");

	const createdPremiseId = ref<number | null>(null);
	const createdCoPremiseId = ref<number | null>(null);
	const createdSecondCoPremiseId = ref<number | null>(null);

	const addReasons = async (parentId: any) => {
		const createdPremise = await create("nodes", {
			title: premise.value,
			parent: parentId,
			owner: ownUser.value?.id,
			argument: props.argument.id,
		});

		createdPremiseId.value = createdPremise.data.id;

		if (coPremise.value !== "") {
			const createdCoPremise = await create("nodes", {
				title: coPremise.value,
				parent: parentId,
				owner: ownUser.value?.id,
				argument: props.argument.id,
			});

			createdCoPremiseId.value = createdCoPremise.data.id;
		}

		if (secondCoPremise.value !== "") {
			const createdSecondCoPremise = await create("nodes", {
				title: secondCoPremise.value,
				parent: parentId,
				owner: ownUser.value?.id,
				argument: props.argument.id,
			});

			createdSecondCoPremiseId.value = createdSecondCoPremise.data.id;
		}

		if (createdCoPremiseId.value && !createdSecondCoPremiseId.value) {
			await update("nodes", createdPremiseId.value, {
				siblings: [createdCoPremiseId.value],
			});
		} else if (createdCoPremiseId.value && createdSecondCoPremiseId.value) {
			await update("nodes", createdPremiseId.value, {
				siblings: [createdCoPremiseId.value, createdSecondCoPremiseId.value],
			});
		}

		if (!createdSecondCoPremiseId.value && createdCoPremiseId.value) {
			await update("nodes", createdCoPremiseId.value, {
				siblings: [createdPremiseId.value],
			});
		} else if (createdSecondCoPremiseId.value && createdCoPremiseId.value) {
			await update("nodes", createdCoPremiseId.value, {
				siblings: [createdPremiseId.value, createdSecondCoPremiseId.value],
			});
		}

		if (createdSecondCoPremiseId.value) {
			await update("nodes", createdSecondCoPremiseId.value, {
				siblings: [createdPremiseId.value, createdCoPremiseId.value],
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
