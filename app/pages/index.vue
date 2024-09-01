<template>
	<UTabs :items="items" @change="onChange" :default-index="-1" />
	<h1>Startseite</h1>
</template>
<script setup lang="ts">
	definePageMeta({
		middleware: "redirect",
	});

	const items = [
		{
			label: "Referenzen",
		},
		{
			label: "Das Team",
		},
		{
			label: "Kontakt",
		},
	];

	const { scrollToAnchor } = useAnchorScroll({
		toTop: {
			scrollOptions: {
				behavior: "smooth",
				offsetTop: 0,
			},
		},
	});

	const onChange = (index: number) => {
		const item = items[index];

		scrollToAnchor(item.label);
	};
</script>
