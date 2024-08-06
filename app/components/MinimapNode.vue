<template>
	<div class="minimap-node">
		<UCard
			:class="{ 'current-node': currentLevel === node.id }"
			class="card"
			@click="navigate(node.id)"
		>
			<span>{{ node.Title }}</span>
		</UCard>
		<div v-if="node.children && node.children.length > 0" class="node-children">
			<MinimapNode
				v-for="child in node.children"
				:key="child.id"
				:node="child"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
	defineProps({
		node: {
			type: Object,
			required: true,
		},
	});
	const route = useRoute();
	const currentLevel = computed(() => Number(route.query.level) || 1);

	const navigate = async (id: string) => {
		navigateTo({
			path: "",
			query: {
				level: id,
			},
		});
	};
</script>

<style scoped>
	.minimap-node {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 10px;
	}

	.node-children {
		display: flex;
		justify-content: center;
		margin-top: 10px;
		padding-top: 10px;
		border-top: 1px solid #ccc;
		width: 100%;
	}

	.current-node {
		color: #fcd34d;
	}

	.card {
		cursor: pointer;
	}
</style>
