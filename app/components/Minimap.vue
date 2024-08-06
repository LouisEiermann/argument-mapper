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

	// Assuming nodes is an array with the top-level node being the root
	const rootNode = computed(() => {
		// Modify this based on your actual data structure
		return props.nodes ?? null;
	});
</script>
