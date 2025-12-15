<template>
  <div class="mb-4">
    <div v-if="isEditing" class="flex flex-col gap-2">
      <UTextarea v-model="editContent" />
      <div class="flex gap-2 justify-end">
        <UButton
          size="xs"
          color="neutral"
          variant="ghost"
          @click="isEditing = false"
        >
          {{ $t("general.cancel") }}
        </UButton>
        <UButton
          size="xs"
          @click="saveEdit"
        >
          {{ $t("general.save") }}
        </UButton>
      </div>
    </div>
    <div v-else class="group relative">
      <div
        class="mb-1 flex items-center gap-2 text-xs"
        :class="isOwnComment ? 'justify-end' : 'justify-start'"
      >
        <span class="font-bold text-gray-700 dark:text-gray-300">
          {{ comment.author?.name || comment.authorUser?.username || $t("general.unknown") }}
        </span>
        <span class="text-gray-400">
          {{ new Date(comment.createdAt).toLocaleString() }}
        </span>
      </div>
      <UChatMessage
        :id="String(comment.id)"
        role="user"
        :parts="[]"
        :content="comment.content"
        :avatar="{ src: getAuthorAvatar(comment.author) }"
        :side="isOwnComment ? 'right' : 'left'"
      >
        <template #actions>
          <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <UButton
              size="xs"
              variant="ghost"
              icon="i-heroicons-arrow-turn-down-left"
              @click="isOpen = true"
            >
              {{ $t("argument.discussion.reply") }}
            </UButton>
            <template v-if="isOwnComment">
              <UButton
                size="xs"
                variant="ghost"
                icon="i-heroicons-pencil"
                @click="startEdit"
              />
              <UButton
                size="xs"
                variant="ghost"
                color="error"
                icon="i-heroicons-trash"
                @click="deleteComment(nodeKey, comment.id)"
              />
            </template>
          </div>
        </template>
      </UChatMessage>

      <!-- Reply Modal -->
      <UModal
        :title="$t('argument.discussion.reply')"
        :description="$t('argument.discussion.replyDescription')"
        v-model:open="isOpen"
      >
        <template #body>
          <div class="space-y-4">
             <UTextarea v-model="reply" :placeholder="$t('argument.discussion.newComment')" />
          </div>
        </template>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="neutral" variant="ghost" @click="isOpen = false">
              {{ $t("general.cancel") }}
            </UButton>
            <UButton @click="addNewComment(node.documentId, comment.id)">
               {{ $t("argument.discussion.reply") }}
            </UButton>
          </div>
        </template>
      </UModal>
    </div>

    <!-- Children -->
    <div v-if="comment.children && comment.children.length > 0" class="ml-8 mt-2 pl-4 border-l border-gray-200 dark:border-gray-800">
      <CommentThread
        v-for="child in comment.children"
        :key="child.id"
        :comment="child"
        :node="node"
        :own-user="ownUser"
        @refresh="$emit('refresh')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps(["comment", "node", "ownUser", "refresh"]);
const emit = defineEmits(["refresh"]);

const nodeKey = computed(() => props.node?.documentId || props.node?.id);
const commentAuthorId = computed(() => props.comment?.authorUser?.id ?? props.comment?.author?.id);
const isOwnComment = computed(() => {
  if (!props.ownUser?.id || !commentAuthorId.value) return false;
  return String(commentAuthorId.value) === String(props.ownUser.id);
});
const reply = ref<string | null>(null);
const isOpen = ref<boolean>(false);
const isEditing = ref(false);
const editContent = ref("");

const client = useStrapiClient();
const { t } = useI18n();
const toast = useToast();

const startEdit = () => {
  editContent.value = props.comment.content;
  isEditing.value = true;
};

const saveEdit = async () => {
    await updateComment(nodeKey.value, props.comment.id, editContent.value);
    isEditing.value = false;
};

const addNewComment = async (id: string | number, threadOf?: number) => {
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
  nodeId: string | number,
  commentId: string,
  content: string
) => {
  try {
    await client(`/comments/api::node.node:${nodeId}/comment/${commentId}`, {
      method: "PUT",
      body: { content: content },
    });
    toast.add({ title: t("notification.saved") });
    emit("refresh");
  } catch (e) {
    console.error("Error updating comment:", e);
    toast.add({ title: t("general.error"), color: "error" });
  }
};

const deleteComment = async (
  nodeId: string | number,
  commentId: string
) => {
  const authorId = props.ownUser?.id;
  if (!authorId) {
    toast.add({ title: t("general.error"), color: "error" });
    return;
  }
  try {
    await client(`/comments/api::node.node:${nodeId}/comment/${commentId}`, {
      method: "DELETE",
      params: { authorId },
    });
    emit("refresh");
  } catch (e) {
    console.error("Error deleting comment:", e);
    toast.add({ title: t("general.error"), color: "error" });
  }
};

const getAuthorAvatar = (author: any) => {
  let url = author?.avatar?.url;
  if (!url && author?.id === props.ownUser?.id) {
    url = props.ownUser?.avatar?.url;
  }
  return url ? useStrapiMedia(url) : undefined;
};
</script>
