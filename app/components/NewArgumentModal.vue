<template>
  <UModal v-model="open">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3
              class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
            >
              {{
                isDebate
                  ? $t("argument.new.newDebate")
                  : $t("argument.new.newBelief")
              }}
            </h3>
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="$emit('update:isOpen')"
            />
          </div>
        </template>

        <div class="space-y-6">
          <!-- Title Input -->
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
          <div v-if="premise">
            <UFormField :label="$t('argument.new.coPremise')" name="coPremise">
              <UInput
                v-model="coPremise"
                :placeholder="$t('argument.new.coPremise')"
                icon="i-heroicons-arrow-path"
              />
            </UFormField>
          </div>

          <!-- Second Co-Premise Input -->
          <div v-if="coPremise">
            <UFormField
              :label="$t('argument.new.secondCoPremise')"
              name="secondCoPremise"
            >
              <UInput
                v-model="secondCoPremise"
                :placeholder="$t('argument.new.secondCoPremise')"
                icon="i-heroicons-arrow-path"
              />
            </UFormField>
          </div>

          <!-- Tags Selection -->
          <div>
            <UFormField :label="$t('argument.new.selectTags')" name="tags">
              <USelect
                v-model="selectedTags"
                :options="tags"
                multiple
                :placeholder="$t('argument.new.selectTags')"
                value-attribute="id"
                option-attribute="name"
                icon="i-heroicons-tag"
              />
            </UFormField>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              color="neutral"
              variant="ghost"
              @click="$emit('update:isOpen')"
            >
              {{ $t("general.cancel") }}
            </UButton>
            <UButton
              color="primary"
              :loading="loading"
              :disabled="!premise || loading"
              @click="onNewThesis"
            >
              {{
                isDebate ? $t("argument.new.newDebate") : $t("argument.new.add")
              }}
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
const emit = defineEmits(["refresh", "update:isOpen"]);
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  isDebate: {
    type: Boolean,
    default: false,
  },
  otherUser: {
    type: Object,
    default: null,
  },
});

const { create, update, delete: _delete } = useStrapi();
const tagsStore = useArgumentTagsStore();
const userStore = useUserStore();

const conclusion = ref("");
const premise = ref("");
const coPremise = ref("");
const secondCoPremise = ref("");
const title = ref("");
const argumentTree = ref();
const loading = ref(false);

const createdPremiseId = ref<number | null>(null);
const createdCoPremiseId = ref<number | null>(null);
const createdSecondCoPremiseId = ref<number | null>(null);

const premiseGroupNodes = ref([]);

const tags = tagsStore.getTags;
const selectedTags = ref([]);
const { user } = toRefs(userStore);

const open = computed({
  get() {
    return props.isOpen;
  },
  set(value) {
    emit("update:isOpen", value);
  },
});

const onNewThesis = async () => {
  loading.value = true;
  try {
    const thesis = (
      await create("nodes", {
        title: conclusion.value,
        thesis: true,
        owner: user.value?.id,
      })
    ).data;

    if (props.isDebate) {
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

    const argumentId = argumentTree.value.data.id;

    await update("nodes", thesis.id, {
      argument: argumentId,
    });

    const createdPremise = await create("nodes", {
      title: premise.value,
      parent: thesis.id,
      owner: user.value?.id,
      argument: argumentId,
    });

    createdPremiseId.value = createdPremise.data.id;

    if (coPremise.value !== "") {
      const createdCoPremise = await create("nodes", {
        title: coPremise.value,
        parent: thesis.id,
        owner: user.value?.id,
        argument: argumentId,
      });

      createdCoPremiseId.value = createdCoPremise.data.id;
    }

    if (secondCoPremise.value !== "") {
      const createdSecondCoPremise = await create("nodes", {
        title: secondCoPremise.value,
        parent: thesis.id,
        owner: user.value?.id,
        argument: argumentId,
      });

      createdSecondCoPremiseId.value = createdSecondCoPremise.data.id;
    }

    premiseGroupNodes.value.push(createdPremiseId.value);

    if (createdCoPremiseId.value) {
      premiseGroupNodes.value.push(createdCoPremiseId.value);
    }

    if (createdSecondCoPremiseId.value) {
      premiseGroupNodes.value.push(createdSecondCoPremiseId.value);
    }

    await create("premise-groups", {
      nodes: premiseGroupNodes.value,
    });

    emit("refresh");
    emit("update:isOpen", false);
  } catch (error) {
    console.error("Error creating argument:", error);
  } finally {
    loading.value = false;
  }
};
</script>
