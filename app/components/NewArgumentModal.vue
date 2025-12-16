<template>
  <UModal
    v-model:open="open"
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
    <UButton
      v-if="showTrigger"
      icon="i-heroicons-user-group"
      size="xl"
      class="text-2xl"
      @click="open = true"
    >
      {{
        isDebate ? $t("argument.new.newDebate") : $t("argument.new.newBelief")
      }}
    </UButton>
    <template #body>
      <div class="space-y-6">
        <UTabs
          v-if="!props.otherUser"
          v-model="modeValue"
          :items="modeTabItems"
          :content="false"
          color="primary"
          variant="pill"
          size="sm"
        />

        <UAlert
          v-if="!canToggleDebate && !isDebate"
          type="warning"
          :title="$t('argument.new.debateUnavailableTitle')"
          :description="$t('argument.new.noFriendsForDebate')"
        />

        <div v-if="isDebate && !props.otherUser">
          <UFormField :label="$t('argument.new.opponent')" name="opponent">
            <USelect
              v-model="selectedOpponentId"
              :items="opponentItems"
              :placeholder="$t('argument.new.opponentPlaceholder')"
              icon="i-heroicons-user"
            />
          </UFormField>
          <p v-if="!opponentItems.length" class="mt-2 text-sm text-(--ui-text-muted)">
            {{ $t("argument.new.noFriendsForDebate") }}
          </p>
        </div>

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
  showTrigger?: boolean;
}>();

const open = defineModel<boolean>("open", { default: false });
const showTrigger = computed(() => props.showTrigger !== false);

const isDebate = ref(props.isDebate || false);
watch(
  () => props.isDebate,
  (value) => {
    if (typeof value === "boolean") isDebate.value = value;
  },
);

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
    coPremise.value.trim().length > 0 &&
    (!isDebate.value || !!effectiveOpponentId.value)
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
const selectedOpponentId = ref<number | null>(null);

const user = useStrapiUser();

const modeTabItems = computed(() => [
  {
    label: t("argument.new.newBelief"),
    value: "belief",
    icon: "i-heroicons-light-bulb",
  },
  {
    label: t("argument.new.newDebate"),
    value: "debate",
    icon: "i-heroicons-chat-bubble-left-right",
    disabled: !canToggleDebate.value,
  },
]);

const modeValue = computed({
  get: () => (isDebate.value ? "debate" : "belief"),
  set: (value: string) => {
    if (value === "debate" && !canToggleDebate.value) return;
    isDebate.value = value === "debate";
  },
});

const canToggleDebate = computed(() => {
  return !!props.otherUser || (user.value?.friends?.length || 0) > 0;
});

const opponentItems = computed(() => {
  if (props.otherUser) return [];
  const friends = user.value?.friends || [];
  return friends.map((f: any) => ({ label: f.username, value: f.id }));
});

const effectiveOpponentId = computed(() => {
  return props.otherUser?.id ?? selectedOpponentId.value ?? null;
});

watch(
  () => open.value,
  (isOpen) => {
    if (!isOpen) return;
    if (props.otherUser) isDebate.value = true;
  },
);

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
      const opponentId = effectiveOpponentId.value;
      if (!opponentId) {
        toast.add({
          title: t("notification.error"),
          description: t("argument.new.debateNeedsOpponentDescription"),
          color: "error",
        });
        return;
      }
      argumentTree.value = await create("argument-trees", {
        title: title.value,
        nodes: thesis.id,
        creator: user.value?.id,
        opponent: opponentId,
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
    open.value = false;
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

watch(
  () => isDebate.value,
  (value) => {
    if (!value) selectedOpponentId.value = null;
  },
);
</script>
