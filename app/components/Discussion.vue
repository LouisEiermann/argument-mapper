<template>
  <div class="flex flex-col gap-4 mb-4 mt-4">
    <UTextarea
      v-model="newComment"
      :placeholder="$t('argument.discussion.newComment')"
    />
    <UButton
      @click="addNewComment(node.documentId)"
      class="self-start inline-block"
      >{{ $t("general.send") }}</UButton
    >
  </div>
  <div>
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
  const comments = await client(
    `/comments/api::node.node:${props.node.documentId}`,
    {
      method: "GET",
    }
  );
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
