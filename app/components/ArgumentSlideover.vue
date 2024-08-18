<template>
	<USlideover v-model="open">
		<div class="p-4 flex-1 scroll">
			<div>
				<UTextarea v-model="node.title" v-if="node.owner.id === ownUser?.id" />
				<UButton @click="save(node.id)" v-if="node.owner.id === ownUser?.id"
					>Speichern</UButton
				>
				<p v-else>{{ node.title }}</p>
			</div>
			<UDivider />
			<div>
				Quellen:
				<UButton @click="openNewSource = true">Neue Quelle hinzufügen</UButton>
			</div>
			<UDivider />
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
					<UInput
						type="text"
						v-model="sourceDescription"
						placeholder="Erklärung der Quelle"
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
	const emit = defineEmits(["refresh", "update:isOpen"]);
	const props = defineProps(["isSlideoverOpen", "node", "ownUser"]);

	const { update } = useStrapi();
	const toast = useToast();
	const { t } = useI18n();

	const openNewSource = ref();
	const sourceUrl = ref();
	const sourceDescription = ref();

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
		emit("refresh");
	};

	const addSource = async (id: string) => {
		await update("nodes", id, props.node);
		toast.add({ title: t("notification.saved") });
		emit("refresh");
	};
</script>
<style lang="scss" scoped>
	.header {
		display: flex;
		justify-content: space-between;
	}
</style>
