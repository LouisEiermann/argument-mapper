<template>
	<UCard>
		<MinimapNode v-if="rootNode" :node="rootNode" />
	</UCard>
</template>

<script setup lang="ts">
	const props = defineProps({
		nodes: {
			type: Object,
			required: true,
		},
	});

	const rootNode = computed(() => {
		return props.nodes ?? null;
	});
</script>
