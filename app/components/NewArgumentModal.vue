<template>
  <UModal
    :close="{
      color: 'neutral',
      variant: 'ghost',
      icon: 'i-heroicons-x-mark',
    }"
    :title="
      isDebate ? $t('argument.new.newDebate') : $t('argument.new.newBelief')
    "
    :description="
      isDebate
        ? $t('argument.new.newDebateDescription')
        : $t('argument.new.newBeliefDescription')
    "
  >
    <UButton icon="i-heroicons-user-group" size="xl" class="text-2xl">
      {{
        isDebate ? $t("argument.new.newDebate") : $t("argument.new.newBelief")
      }}
    </UButton>
    <template #body>
      <div class="space-y-6">
        <UButton
          color="neutral"
          :icon="
            isDebate
              ? 'i-heroicons-chat-bubble-left-right'
              : 'i-heroicons-light-bulb'
          "
          @click="isDebate = !isDebate"
        >
          {{
            isDebate
              ? $t("argument.new.switchToBelief")
              : $t("argument.new.switchToDebate")
          }}
        </UButton>
        <div>
          <UFormField :label="$t('argument.new.title')" name="title">
            <UInput
              v-model="title"
              :placeholder="$t('argument.new.title')"
              icon="i-heroicons-document-text"
            />
          </UFormField>
        </div>

        <!-- Thesis Input -->
        <div>
          <UFormField :label="$t('argument.new.thesis')" name="thesis">
            <UInput
              v-model="conclusion"
              :placeholder="$t('argument.new.thesis')"
              icon="i-heroicons-light-bulb"
            />
          </UFormField>
        </div>

        <!-- Premise Input -->
        <div>
          <UFormField :label="$t('argument.new.premise')" name="premise">
            <UInput
              v-model="premise"
              :placeholder="$t('argument.new.premise')"
              icon="i-heroicons-arrow-path"
            />
          </UFormField>
        </div>

        <!-- Co-Premise Input -->
        <div>
          <UFormField :label="$t('argument.new.coPremise')" name="coPremise">
            <UInput
              v-model="coPremise"
              :placeholder="$t('argument.new.coPremise')"
              icon="i-heroicons-arrow-path"
            />
          </UFormField>
        </div>

        <!-- Tags Selection -->
        <div>
          <UFormField :label="$t('argument.new.selectTags')" name="tags">
            <USelect
              v-model="selectedTags"
              :items="tags"
              multiple
              :placeholder="$t('argument.new.selectTags')"
              icon="i-heroicons-tag"
            />
          </UFormField>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton
          color="primary"
          :loading="loading"
          :disabled="!canCreateArgument || loading"
          @click="onNewThesis"
        >
          {{
            isDebate
              ? $t("argument.new.newDebate")
              : $t("argument.new.newBelief")
          }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
const emit = defineEmits<{
  "update:isOpen": [value: boolean];
  refresh: [];
}>();

const props = defineProps<{
  otherUser?: any;
  isDebate?: boolean;
}>();

const isDebate = ref(props.isDebate || false);

const { find, create, update, delete: _delete } = useStrapi();
const toast = useToast();
const { t } = useI18n();

const conclusion = ref("");
const premise = ref("");
const coPremise = ref("");
const title = ref("");
const argumentTree = ref();
const loading = ref(false);

const canCreateArgument = computed(() => {
  return (
    conclusion.value.trim().length > 0 &&
    premise.value.trim().length > 0 &&
    coPremise.value.trim().length > 0
  );
});

const { data: tagsData } = await useAsyncData("tags", async () => {
  const response = await find("tags", {
    populate: {
      localizations: true,
      defaultMood: true,
    },
  });
  return response?.data || [];
});

const tags = computed(() => {
  return (
    tagsData.value?.map((tag: any) => ({
      label: tag.name || "",
      value: tag.id,
    })) || []
  );
});

const selectedTags = ref([]);

const user = useStrapiUser();

const onNewThesis = async () => {
  if (!canCreateArgument.value) return;
  loading.value = true;
  try {
    // First create the thesis node
    const thesis = (
      await create("nodes", {
        title: conclusion.value.trim(),
        thesis: true,
        owner: user.value?.id,
      })
    ).data;
    console.log("Created thesis:", thesis);

    // Then create the argument tree
    if (isDebate.value) {
      argumentTree.value = await create("argument-trees", {
        title: title.value,
        nodes: thesis.id,
        creator: user.value?.id,
        opponent: props.otherUser.id,
        tags: selectedTags.value,
      });
    } else {
      argumentTree.value = await create("argument-trees", {
        title: title.value,
        nodes: thesis.id,
        creator: user.value?.id,
        tags: selectedTags.value,
      });
    }
    console.log("Created argument tree:", argumentTree.value);

    const argumentId = argumentTree.value.data.id;

    // Create all premises first
    const createdPremise = await create("nodes", {
      title: premise.value.trim(),
      parent: thesis.id,
      owner: user.value?.id,
      argument: argumentId,
    });

    const createdCoPremise = await create("nodes", {
      title: coPremise.value.trim(),
      parent: thesis.id,
      owner: user.value?.id,
      argument: argumentId,
    });

    await create("premise-groups", {
      nodes: [
        createdPremise.data.documentId ?? createdPremise.data.id,
        createdCoPremise.data.documentId ?? createdCoPremise.data.id,
      ],
    });

    // Finally update the thesis node with the argument ID
    await update("nodes", thesis.documentId, {
      argument: argumentId,
    });

    // Navigate to the new argument view
    await navigateTo({
      name: "argument-id",
      params: { id: argumentId },
    });

    emit("refresh");
    emit("update:isOpen", false);
    conclusion.value = "";
    premise.value = "";
    coPremise.value = "";
    title.value = "";
    selectedTags.value = [];
  } catch (error) {
    console.error("Error creating argument:", error);
    toast.add({
      title: t("notification.error"),
      description: error.message || t("notification.errorDescription"),
      color: "error",
    });
  } finally {
    loading.value = false;
  }
};
</script>
