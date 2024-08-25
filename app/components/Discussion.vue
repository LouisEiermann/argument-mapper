<template>
	<div>
		<UTextarea v-model="newComment" placeholder="Neuer Kommentar" />
		<UButton @click="addNewComment(node.id)">Send</UButton>
		<UDivider />

		<CommentThread
			v-for="comment in data?.comments"
			:key="comment.id"
			:comment="comment"
			:node="node"
			:own-user="ownUser"
			@refresh="refresh"
			:refresh="refresh"
		/>
	</div>
</template>
<script lang="ts" setup>
	const props = defineProps(["node"]);

	const newComment = ref<string | null>(null);
	const client = useStrapiClient();
	const route = useRoute();
	const { fetchUser } = useStrapiAuth();
	const ownUser = await fetchUser();

	const { data, refresh } = useAsyncData("comments", async () => {
		const comments = await client(`/comments/api::node.node:${props.node.id}`, {
			method: "GET",
		});
		return { comments };
	});

	watchEffect(() => {
		const level = route.query.level;
		if (level) {
			refresh();
		}
	});

	const addNewComment = async (id: string) => {
		await client(`/comments/api::node.node:${id}`, {
			method: "POST",
			body: { content: newComment.value },
		});
		newComment.value = "";
		refresh();
	};
</script>
