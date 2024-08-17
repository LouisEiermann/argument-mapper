<template>
	<UCard>
		<MinimapNode v-if="rootNode" :node="rootNode" />
	</UCard>
</template>

<script setup lang="ts">
	const props = defineProps({
		node: {
			type: Object,
			required: true,
		},
	});

	const rootNode = computed(() => {
		return props.node ?? null;
	});
</script>
