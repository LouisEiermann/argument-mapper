<template>
	<div class="minimap-node" v-if="node">
		<UCard
			:class="{
				'current-node':
					currentLevel === node.id || (node.thesis && currentLevel === null),
				'is-objection':
					node?.owner.id !== node?.parent?.owner.id && node.parent,
			}"
			class="card"
			@click="navigate(node.id)"
		>
			<span>{{ node.title }}</span>
			<UAvatar
				:src="useStrapiMedia(node.owner.avatar?.url)"
				class="avatar"
				v-if="node.owner.avatar?.url"
			/>
			<UAvatar :src="null" :alt="node.owner.username" class="avatar" v-else />
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
	const currentLevel = computed(() => Number(route.query.level) || null);

	const navigate = async (id: string) => {
		navigateTo({
			path: "",
			query: {
				level: id,
			},
		});
	};
</script>

<style lang="scss" scoped>
	.minimap-node {
		display: flex;
		flex-direction: column;
		margin: 10px;
	}

	.node-children {
		display: flex;
		justify-content: center;
		margin-top: 10px;
		padding-top: 10px;
		width: 100%;
	}

	.card {
		cursor: pointer;
		background-color: rgb(34, 197, 94);
		color: white;
		position: relative;

		&.current-node {
			color: #fcd34d;
		}

		.avatar {
			position: absolute;
			top: -1rem;
			right: 1rem;
		}
	}

	.is-objection {
		background-color: red;
	}
</style>
