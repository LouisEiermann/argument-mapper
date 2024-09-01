<template>
	<USlideover v-model="open">
		<div class="p-4 flex-1 overflow-scroll">
			<div class="flex flex-col gap-4 mb-4">
				<UInput v-model="node.title" v-if="node.owner.id === ownUser?.id" />
				<UTextarea
					v-model="node.description"
					v-if="node.owner.id === ownUser?.id"
					placeholder="Elaborate on this premise"
				/>
				<UButton
					@click="save(node.id)"
					v-if="node.owner.id === ownUser?.id"
					class="self-start inline-block"
					>Speichern</UButton
				>
				<p v-else>{{ node.title }}</p>
			</div>
			<UDivider label="Quellen" />
			<div class="sources">
				<div v-for="source of node.sources">
					<UInput
						v-model="source.url"
						v-if="node.owner.id === ownUser?.id"
						placeholder="https://source.com"
					/>
					<UButton
						@click="update('sources', source.id, source), refresh()"
						v-if="node.owner.id === ownUser?.id"
						>Speichern</UButton
					>
					<UButton
						@click="strapiDelete('sources', source.id), refresh()"
						v-if="node.owner.id === ownUser?.id"
						color="red"
						>Löschen</UButton
					>
					<p v-else>{{ source.url }}</p>
				</div>
				<UButton
					@click="openNewSource = true"
					v-if="node.owner.id === ownUser?.id"
					>Neue Quelle hinzufügen</UButton
				>
			</div>
			<UDivider label="Diskussion" />
			<Discussion :node="node" />
		</div>
		<UModal v-model="openNewSource">
			<UCard
				:ui="{
					ring: '',
					divide: 'divide-y divide-gray-100 dark:divide-gray-800',
				}"
			>
				<template #header>
					<div class="header">
						<h1>Neue Quelle hinzufügen</h1>
						<UButton
							color="gray"
							variant="ghost"
							icon="i-heroicons-x-mark-20-solid"
							class="-my-1"
							@click="openNewSource = false"
						/>
					</div>
				</template>

				<div class="space-y-6">
					<UInput
						type="text"
						v-model="sourceUrl"
						placeholder="URL zur Quelle"
					/>
				</div>

				<template #footer>
					<UButton @click="addSource(node?.id)">{{
						$t("argument.new.add")
					}}</UButton>
				</template>
			</UCard>
		</UModal>
	</USlideover>
</template>
<script lang="ts" setup>
	const emit = defineEmits(["update:isOpen"]);
	const props = defineProps(["isSlideoverOpen", "node", "ownUser"]);

	const { create, update, delete: strapiDelete } = useStrapi();
	const toast = useToast();
	const { t } = useI18n();
	const { isUrlValid } = useUrlValidation();

	const openNewSource = ref();
	const sourceUrl = ref();

	const refresh = inject("refresh");

	const open = computed({
		get() {
			return props.isSlideoverOpen;
		},
		set(value) {
			emit("update:isOpen", value);
		},
	});

	const save = async (id: string) => {
		await update("nodes", id, props.node);
		toast.add({ title: t("notification.saved") });
		refresh();
	};

	const addSource = async () => {
		if (isUrlValid(sourceUrl.value)) {
			const newSource = await create("sources", {
				url: sourceUrl.value,
			});

			const updatedSources = [...(props.node.sources || []), newSource.data.id];

			await update("nodes", props.node.id, { sources: updatedSources });

			sourceUrl.value = "";

			toast.add({ title: t("notification.saved") });
			refresh();
			openNewSource.value = false;
		} else {
			toast.add({
				title: t(
					"Wrong URL Pattern! Try something like: 'https://my-source.com'"
				),
			});
		}
	};
</script>
<style lang="scss" scoped>
	.header {
		display: flex;
		justify-content: space-between;
	}

	.sources {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 1rem;
		margin-top: 1rem;
		margin-bottom: 1rem;

		* {
			display: flex;
			align-items: flex-start;
			gap: 1rem;
		}
	}
</style>
