<template>
  <UCard class="mb-4">
    <template #header>
      <h1 class="rounded-md">{{ comment.author.name }}</h1>
      <p>{{ comment.createdAt }}</p>
    </template>

    <div
      v-if="comment.author.id === ownUser?.id"
      class="relative flex flex-col gap-4 mb-4"
    >
      <UTextarea v-model="comment.content" />
      <div class="flex gap-4">
        <UButton @click="updateComment(node.id, comment.id, comment.content)">
          Update Comment
        </UButton>
        <UButton
          color="error"
          class="absolute -top-4 right-4"
          icon="i-heroicons-x-circle-20-solid"
          @click="deleteComment(node.id, comment.id, comment.author.id)"
        />
        <UButton
          @click="((isOpen = true), (currentCommentToReplyTo = comment.id))"
        >
          {{ $t("argument.discussion.reply") }}
        </UButton>
      </div>
    </div>
    <div v-else>
      <p>{{ comment.content }}</p>
      <UButton
        class="m-4"
        @click="((isOpen = true), (currentCommentToReplyTo = comment.id))"
      >
        {{ $t("argument.discussion.reply") }}
      </UButton>
    </div>

    <div v-if="comment.children && comment.children.length > 0" class="ml-4">
      <CommentThread
        v-for="child in comment.children"
        :key="child.id"
        :comment="child"
        :node="node"
        :own-user="ownUser"
        @refresh="refresh"
      />
    </div>

    <UModal v-model="isOpen" :description="$t('argument.discussion.reply')">
      <UCard
        :ui="{
          ring: '',
          divide: 'divide-y divide-gray-100 dark:divide-gray-800',
        }"
      >
        <template #header>
          <div class="flex justify-between">
            <h1>{{ $t("argument.discussion.reply") }}</h1>
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="isOpen = false"
            />
          </div>
        </template>

        <div class="space-y-6">
          <UInput v-model="reply" />
        </div>

        <template #footer>
          <UButton @click="addNewComment(node.id, currentCommentToReplyTo)">
            {{ $t("argument.discussion.reply") }}
          </UButton>
        </template>
      </UCard>
    </UModal>
  </UCard>
</template>

<script lang="ts" setup>
defineProps(["comment", "node", "ownUser", "refresh"]);
const emit = defineEmits(["refresh"]);

const reply = ref<string | null>(null);
const isOpen = ref<boolean>(false);
const currentCommentToReplyTo = ref<number>();

const client = useStrapiClient();
const { t } = useI18n();
const toast = useToast();

const addNewComment = async (id: string, threadOf?: number) => {
  if (threadOf) {
    await client(`/comments/api::node.node:${id}`, {
      method: "POST",
      body: { content: reply.value, threadOf: threadOf },
    });

    reply.value = "";
    isOpen.value = false;
  }
  emit("refresh");
};

const updateComment = async (
  nodeId: string,
  commentId: string,
  content: string
) => {
  await client(`/comments/api::node.node:${nodeId}/comment/${commentId}`, {
    method: "PUT",
    body: { content: content },
  });
  toast.add({ title: t("notification.saved") });
  emit("refresh");
};

const deleteComment = async (
  nodeId: string,
  commentId: string,
  authorId: string
) => {
  await client(
    `/comments/api::node.node:${nodeId}/comment/${commentId}?authorId=${authorId}`,
    {
      method: "DELETE",
    }
  );
  emit("refresh");
};
</script>
