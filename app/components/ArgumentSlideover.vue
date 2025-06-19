<template>
  <USlideover v-model:open="open">
    <template #content
      ><div class="p-4 flex-1 overflow-scroll">
        <div
          v-if="node.owner.id === ownUser?.id"
          class="flex flex-col gap-4 mb-4"
        >
          <UInput
            v-model="node.title"
            :placeholder="$t('argument.new.title')"
          />
          <UTextarea
            v-model="node.description"
            v-if="node.owner.id === ownUser?.id"
            :placeholder="$t('argument.slideover.elaboratePremise')"
          />
          <UButton
            @click="save()"
            v-if="node.owner.id === ownUser?.id"
            class="self-start inline-block"
            >{{ $t("general.save") }}</UButton
          >
        </div>
        <div v-else>
          <p>{{ node.title }}</p>
          <p>{{ node.description }}</p>
        </div>

        <USeparator :label="$t('argument.new.sources')" />
        <div class="flex flex-col items-start gap-4 my-4">
          <UModal
            :description="$t('argument.new.addSourceDescription')"
            :title="$t('argument.new.addSource')"
            :close="{
              color: 'neutral',
              variant: 'ghost',
              icon: 'i-heroicons-x-mark-20-solid',
            }"
            v-model:open="openNewSource"
          >
            <UButton v-if="node.owner.id === ownUser?.id">{{
              $t("argument.new.addSource")
            }}</UButton>

            <template #body>
              <div class="space-y-6">
                <UInput
                  type="text"
                  v-model="sourceUrl"
                  :placeholder="$t('argument.new.sourceUrl')"
                />
              </div>
            </template>

            <template #footer>
              <UButton @click="addSource()">{{ $t("general.save") }}</UButton>
            </template>
          </UModal>
          <div v-for="source of node.sources" class="flex items-start gap-4">
            <UInput
              v-model="source.url"
              v-if="node.owner.id === ownUser?.id"
              :placeholder="$t('argument.new.sourceUrl')"
            />
            <UButton
              @click="
                update('sources', source.documentId, {
                  url: source.url,
                })
              "
              v-if="node.owner.id === ownUser?.id"
              >{{ $t("general.save") }}</UButton
            >
            <UButton
              @click="(strapiDelete('sources', source.documentId), refresh())"
              v-if="node.owner.id === ownUser?.id"
              color="error"
              >{{ $t("general.delete") }}</UButton
            >
            <p v-else>{{ source.url }}</p>
          </div>
          <p v-if="!node.sources.length && node.owner.id !== ownUser?.id">
            {{ $t("argument.new.noSources") }}
          </p>
        </div>
        <USeparator :label="$t('argument.discussion.title')" />
        <Discussion :node="node" />
      </div>
    </template>
  </USlideover>
</template>
<script lang="ts" setup>
const emit = defineEmits(["update:isOpen"]);
const props = defineProps(["isSlideoverOpen", "node", "ownUser"]);

const { create, update, delete: strapiDelete } = useStrapi();
const toast = useToast();
const { t } = useI18n();
const { isUrlValid } = useUrlValidation();

const openNewSource = ref();
const sourceUrl = ref();

const refresh = inject("refresh");

const open = computed({
  get() {
    return props.isSlideoverOpen;
  },
  set(value) {
    emit("update:isOpen", value);
  },
});

const save = async () => {
  await update("nodes", props.node.documentId, {
    title: props.node.title,
    description: props.node.description,
  });
  toast.add({ title: t("notification.saved") });
  refresh();
};

const addSource = async () => {
  console.log(props.node.documentId);
  if (isUrlValid(sourceUrl.value)) {
    const newSource = await create("sources", {
      url: sourceUrl.value,
    });

    const updatedSources = [
      ...(props.node.sources.map((source) => source.documentId) || []),
      newSource.data.documentId,
    ];

    await update("nodes", props.node.documentId, { sources: updatedSources });

    sourceUrl.value = "";

    toast.add({ title: t("notification.saved") });
    refresh();
    openNewSource.value = false;
  } else {
    toast.add({
      title: t("notification.wrongUrlPattern"),
    });
  }
};
</script>
