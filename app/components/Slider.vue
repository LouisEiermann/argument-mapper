<template>
	<UCarousel
		v-slot="{ item }"
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
						v-if="node.owner?.id === ownUser?.id && !node.Thesis"
						class="delete-button"
						@click="deleteReason(node?.id)"
						icon="i-heroicons-x-circle-20-solid"
						color="red"
					></UButton>

					<p>{{ node.Title }}</p>

					<UButton
						class="move-down"
						@click="descendLevel(node?.id)"
						icon="i-heroicons-arrow-down-16-solid"
					/>
				</UCard>
			</div>
		</div>
	</UCarousel>
</template>
<script setup lang="ts">
	defineProps(["sliderItems", "userIsCreator", "isUnilateral", "isNotValid"]);

	const { delete: deleteStrapi } = useStrapi();
	const isSlideroverOpen = ref(false);
	const { fetchUser } = useStrapiAuth();
	const ownUser = await fetchUser();

	const refresh = inject("refresh");

	const deleteReason = async (id: string) => {
		await deleteStrapi("nodes", id);
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
			margin-bottom: 2rem;
		}
	}

	.text-center {
		margin-bottom: 2rem;
		margin-top: 2rem;
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
