<template>
	<UModal v-model="open">
		<UCard
			:ui="{
				ring: '',
				divide: 'divide-y divide-gray-100 dark:divide-gray-800',
			}"
		>
			<template #header>
				<div class="header">
					<h1>{{ isDebate ? "Neue Debatte" : "Neue Überzeugung" }}</h1>
					<UButton
						color="gray"
						variant="ghost"
						icon="i-heroicons-x-mark-20-solid"
						class="-my-1"
						@click="$emit('update:isOpen')"
					/>
				</div>
			</template>
			<div class="space-y-6">
				<UInput
					type="text"
					v-model="title"
					:placeholder="$t('argument.new.title')"
				/>
				<UInput
					type="text"
					v-model="conclusion"
					:placeholder="$t('argument.new.thesis')"
				/>
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
				<USelectMenu
					:options="tags"
					multiple
					v-model="selectedTags"
					placeholder="Tags auswählen"
					value-attribute="id"
					option-attribute="name"
				>
					<UButton
						label="Tags"
						trailing-icon="i-heroicons-chevron-down-20-solid"
				/></USelectMenu>
			</div>

			<template #footer>
				<UButton @click="onNewThesis" :disabled="premise === ''">{{
					isDebate ? "Herausfordern" : "Hinzufügen"
				}}</UButton>
			</template>
		</UCard>
	</UModal>
</template>
<script lang="ts" setup>
	const emit = defineEmits(["refresh", "update:isOpen"]);
	const props = defineProps(["isOpen", "isDebate", "otherUser"]);

	const { create, update, delete: _delete } = useStrapi();
	const tagsStore = useArgumentTagsStore();
	const userStore = useUserStore();

	const conclusion = ref("");
	const premise = ref("");
	const coPremise = ref("");
	const secondCoPremise = ref("");
	const title = ref("");
	const argumentTree = ref();

	const createdPremiseId = ref<number | null>(null);
	const createdCoPremiseId = ref<number | null>(null);
	const createdSecondCoPremiseId = ref<number | null>(null);

	const tags = tagsStore.getTags;
	const selectedTags = ref([]);
	const { user } = toRefs(userStore);

	const open = computed({
		get() {
			return props.isOpen;
		},
		set(value) {
			emit("update:isOpen", value);
		},
	});

	const onNewThesis = async () => {
		const thesis = (
			await create("nodes", {
				title: conclusion.value,
				thesis: true,
				owner: user.value?.id,
			})
		).data;

		if (props.isDebate) {
			argumentTree.value = await create("argument-trees", {
				title: title.value,
				nodes: thesis.id,
				creator: user.value?.id,
				opponent: props.otherUser.id,
				tags: selectedTags.value,
			});
		} else {
			argumentTree.value = await create("argument-trees", {
				title: title.value,
				nodes: thesis.id,
				creator: user.value?.id,
				tags: selectedTags.value,
			});
		}

		const argumentId = argumentTree.value.data.id;

		await update("nodes", thesis.id, {
			argument: argumentId,
		});

		const createdPremise = await create("nodes", {
			title: premise.value,
			parent: thesis.id,
			owner: user.value?.id,
			argument: argumentId,
		});

		createdPremiseId.value = createdPremise.data.id;

		if (coPremise.value !== "") {
			const createdCoPremise = await create("nodes", {
				title: coPremise.value,
				parent: thesis.id,
				owner: user.value?.id,
				argument: argumentId,
			});

			createdCoPremiseId.value = createdCoPremise.data.id;
		}

		if (secondCoPremise.value !== "") {
			const createdSecondCoPremise = await create("nodes", {
				title: secondCoPremise.value,
				parent: thesis.id,
				owner: user.value?.id,
				argument: argumentId,
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

		emit("refresh");
		emit("update:isOpen", false);
	};
</script>
<style lang="scss" scoped>
	.header {
		display: flex;
		justify-content: space-between;
	}
</style>
