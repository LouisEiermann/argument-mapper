<template>
  <div
    class="flex flex-col items-center relative min-h-[368px] min-w-[664px] justify-center m-8"
  >
    <Minimap :node="wholeTree" />
  </div>
  <div
    class="flex flex-col items-center relative min-h-[368px] min-w-[664px] justify-center m-8"
  >
    <UCard
      class="w-[300px] h-[200px] relative mb-8"
      :class="{
        'shadow-[5px_5px_5px_rgb(239,68,68)]': node.soundnessDoubted,
        'opacity-50': isNotValid,
      }"
      @click="isSlideoverOpen = true"
    >
      <UButton
        v-if="node.owner?.id === ownUser?.id && !node.thesis"
        class="absolute -top-4 right-4"
        icon="i-heroicons-x-circle-20-solid"
        color="error"
        @click.stop="deleteReason(node.documentId)"
      />
      <UButton
        v-if="node.parent"
        class="absolute -top-4 left-[8.5rem]"
        icon="i-heroicons-arrow-up-16-solid"
        @click.stop="ascendLevel(node.parent?.id)"
      />
      <UBadge v-if="node.thesis" color="secondary">{{
        $t("general.thesis")
      }}</UBadge>
      <UBadge v-if="node.children.length === 0" color="secondary">{{
        $t("general.leaf")
      }}</UBadge>
      <p>{{ node.title }}</p>
    </UCard>
    <div
      v-if="
        node.children?.length > 0 && !userIsCreator && !node.formalFallacyBelow
      "
      class="flex flex-col gap-2"
    >
      <UButton
        color="secondary"
        :label="$t('argument.doubtValidity')"
        trailing-icon="i-heroicons-chevron-down-20-solid"
        @click="
          () => {
            currentDropdownNode = node?.documentId;
            console.log(
              'Dropdown button clicked, set currentDropdownNode to:',
              node?.documentId
            );
          }
        "
      />
      <USelect
        v-model="selectedFormalFallacy"
        :items="formalFallacies"
        :placeholder="$t('argument.doubtValidity')"
        @update:model-value="onFormalFallacySelected"
      />
    </div>
    <UButton
      v-if="
        !userIsCreator &&
        node.children.length === 0 &&
        node.parent?.formalFallacyBelow
      "
      color="primary"
      @click="markAsValid"
      >{{ $t("argument.markAsValid") }}
    </UButton>
    <UButton
      v-if="
        !userIsCreator &&
        node.children.length === 0 &&
        !node.soundnessDoubted &&
        !node.parent?.formalFallacyBelow
      "
      color="primary"
      @click="markAsNotSound(node.documentId)"
      >{{ $t("argument.markAsNotSound") }}
    </UButton>
    <UButton
      v-if="
        !userIsCreator && node.children.length === 0 && node.soundnessDoubted
      "
      color="primary"
      @click="markAsSound(node.documentId)"
      >{{ $t("argument.markAsSound") }}
    </UButton>
    <UModal
      :description="
        node.owner.id === ownUser?.id
          ? $t('argument.support.add')
          : $t('argument.objection.add')
      "
      :title="
        node.owner.id === ownUser?.id
          ? $t('argument.support.add')
          : $t('argument.objection.add')
      "
      :close="{
        color: 'neutral',
        variant: 'ghost',
        icon: 'i-heroicons-x-mark-20-solid',
      }"
      v-model:open="isOpen"
    >
      <UButton v-if="node.owner?.id !== ownUser?.id" color="error"
        >{{ $t("argument.objection.add") }}
      </UButton>
      <UButton v-else color="primary">{{ $t("argument.support.add") }}</UButton>

      <template #body>
        <div class="space-y-6 flex flex-col">
          <UInput
            v-model="premise"
            type="text"
            :placeholder="$t('argument.new.premise')"
          />
          <UInput
            v-if="premise != ''"
            v-model="coPremise"
            type="text"
            :placeholder="$t('argument.new.coPremise')"
          />
          <UInput
            v-if="coPremise != ''"
            v-model="secondCoPremise"
            type="text"
            :placeholder="$t('argument.new.secondCoPremise')"
          />
        </div>
      </template>

      <template #footer>
        <UButton
          v-if="node.owner?.id !== ownUser?.id"
          @click="addReasons(node?.id)"
          color="error"
          >{{ $t("argument.objection.add") }}</UButton
        >
        <UButton v-else @click="addReasons(node?.id)">{{
          $t("argument.support.add")
        }}</UButton>
      </template>
    </UModal>
    <UModal
      :description="$t('argument.tagging.description')"
      :title="$t('argument.tagging.title')"
      :close="{
        color: 'neutral',
        variant: 'ghost',
        icon: 'i-heroicons-x-mark-20-solid',
      }"
    >
      <UButton
        v-if="node.owner?.id !== ownUser?.id && !node.thesis"
        color="primary"
        >{{ $t("argument.tagging.title") }}</UButton
      >
      <template #body>
        <div class="flex flex-col gap-4">
          <USelectMenu
            v-model="selectedFormalFellacies"
            type="text"
            :items="formalFallacies"
            :placeholder="$t('argument.formalFallacies')"
            multiple
          />
          <USelectMenu
            v-model="selectedInformalFellacies"
            type="text"
            :items="informalFellacies"
            :placeholder="$t('argument.informalFallacies')"
            multiple
            icon="i-heroicons-tag"
          />
          <USelectMenu
            v-model="selectedCommonPatterns"
            type="text"
            :items="commonPatterns"
            :placeholder="$t('argument.commonPatterns')"
            multiple
            icon="i-heroicons-tag"
          />
        </div>
      </template>

      <template #footer>
        <UButton
          @click="addPremiseGroupTag(node.premiseGroup.documentId)"
          :disabled="
            selectedFormalFellacies.length === 0 &&
            selectedInformalFellacies.length === 0 &&
            selectedCommonPatterns.length === 0
          "
          >{{ $t("general.save") }}</UButton
        >
      </template>
    </UModal>
    <div
      v-if="
        node.children &&
        node.children.length > 0 &&
        node.level <= currentLevel &&
        !end
      "
      class="flex justify-center relative"
    >
      <Slider
        :slider-items="itemsGroupedByCoPremises"
        :is-not-valid="node.formalFallacyBelow || isNotValid"
        :user-is-creator="userIsCreator"
      />
    </div>
  </div>
  <ArgumentSlideover
    :is-slideover-open="isSlideoverOpen"
    :node="node"
    :own-user="ownUser"
    @update:is-open="isSlideoverOpen = $event"
  />
</template>
<script setup lang="ts">
const props = defineProps([
  "node",
  "isNotValid",
  "userIsCreator",
  "parent",
  "end",
  "wholeTree",
  "argument",
]);

const { create, delete: deleteStrapi, update, find } = useStrapi();
const isOpen = ref(false);
const isTaggingOpen = ref(false);
const isSlideoverOpen = ref(false);
const currentDropdownNode = ref();
const route = useRoute();
const currentLevel = computed(() => Number(route.query.level) || 1);
const { fetchUser } = useStrapiAuth();
const ownUser = await fetchUser();
const refresh = inject("refresh");

const premise = ref("");
const coPremise = ref("");
const secondCoPremise = ref("");

const selectedFormalFellacies = ref([]);
const selectedInformalFellacies = ref([]);
const selectedCommonPatterns = ref([]);
const selectedFormalFallacy = ref(null);

const createdPremiseId = ref<number | null>(null);
const createdCoPremiseId = ref<number | null>(null);
const createdSecondCoPremiseId = ref<number | null>(null);

const premiseGroupNodes = ref([]);

const { data: premiseGroupData } = useAsyncData(
  "premiseGroupData",
  async () => {
    const premiseGroupTags = (await find("premise-group-tags")).data;
    return { premiseGroupTags };
  }
);

const formalFallacies = [
  { label: "Affirming the Consequent", value: "affirming_consequent" },
  { label: "Denying the Antecedent", value: "denying_antecedent" },
  {
    label: "Affirmative Conclusion from a Negative Premise (Illicit Negative)",
    value: "illicit_negative",
  },
  {
    label:
      "Negative Conclusion from Affirmative Premises (Illicit Affirmative)",
    value: "illicit_affirmative",
  },
  { label: "Undistributed Middle", value: "undistributed_middle" },
  { label: "Illicit Major", value: "illicit_major" },
  { label: "Illicit Minor", value: "illicit_minor" },
  {
    label:
      "Fallacy of Exclusive Premises (Drawing an Affirmative Conclusion from Negative Premises)",
    value: "exclusive_premises",
  },
  { label: "Existential Fallacy", value: "existential_fallacy" },
  {
    label: "Fallacy of Four Terms (Quaternio Terminorum)",
    value: "four_terms",
  },
  {
    label: "Fallacy of the Undistributed Middle (Infima Species)",
    value: "undistributed_middle_infima",
  },
  {
    label:
      "Fallacy of Illicit Process (Fallacy of the Illicit Major/Minor Term)",
    value: "illicit_process",
  },
  { label: "Modal Fallacy", value: "modal_fallacy" },
];

const informalFellacies = computed(() => {
  if (!premiseGroupData.value?.premiseGroupTags) return [];

  return premiseGroupData.value.premiseGroupTags
    .filter((tag: any) => tag.type === "informalFallacy")
    .map((tag: any) => ({
      label: tag.name,
      value: tag.id,
    }));
});

const commonPatterns = computed(() => {
  if (!premiseGroupData.value?.premiseGroupTags) return [];

  return premiseGroupData.value.premiseGroupTags
    .filter((tag: any) => tag.type === "commonPattern")
    .map((tag: any) => ({
      label: tag.name,
      value: tag.id,
    }));
});

const addReasons = async (parentId: any) => {
  const createdPremise = await create("nodes", {
    title: premise.value,
    parent: parentId,
    owner: ownUser.value?.id,
    argument: props.argument.id,
  });

  createdPremiseId.value = createdPremise.data.id;

  if (coPremise.value !== "") {
    const createdCoPremise = await create("nodes", {
      title: coPremise.value,
      parent: parentId,
      owner: ownUser.value?.id,
      argument: props.argument.id,
    });

    createdCoPremiseId.value = createdCoPremise.data.id;
  }

  if (secondCoPremise.value !== "") {
    const createdSecondCoPremise = await create("nodes", {
      title: secondCoPremise.value,
      parent: parentId,
      owner: ownUser.value?.id,
      argument: props.argument.id,
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

  refresh();
  isOpen.value = false;
};

const addPremiseGroupTag = async (premiseGroup: string) => {
  // Extract only the IDs from the selected items
  const selectedIds = [
    ...selectedFormalFellacies.value.map((item: any) => item.value),
    ...selectedInformalFellacies.value.map((item: any) => item.value),
    ...selectedCommonPatterns.value.map((item: any) => item.value),
  ];

  await update("premise-groups", premiseGroup, {
    premiseGroupTags: selectedIds,
  });

  refresh();
  isTaggingOpen.value = false;
};

const deleteReason = async (id: string) => {
  await deleteStrapi("nodes", id);
  refresh();
};

const markAsNotSound = async (id: string) => {
  await update("nodes", id, { soundnessDoubted: true });
  refresh();
};

const markAsSound = async (id: string) => {
  await update("nodes", id, { soundnessDoubted: false });
  refresh();
};

const markAsValid = async () => {
  await update("nodes", props.node.documentId, {
    formalFallacyBelow: "",
  });
  refresh();
};

const ascendLevel = async (id: string) => {
  navigateTo({
    path: "",
    query: {
      level: id,
    },
  });
};

const groupItemsByPremiseGroup = (items) => {
  // Map to track visited nodes
  const visited = new Set();
  // Array to hold the final groups
  const groups = [];

  // Create a map for quick lookup of nodes by their ID
  const nodesById = new Map(items.map((item) => [item.id, item]));

  // Create a map for nodes by their premiseGroup ID
  const groupsByPremiseGroupId = new Map();

  // Helper function to add items to the group
  function addGroup(item) {
    const group = new Set();
    const queue = [item];

    while (queue.length > 0) {
      const current = queue.shift();
      if (!visited.has(current.id)) {
        visited.add(current.id);
        group.add(current);

        // Enqueue other nodes in the same premiseGroup
        const premiseGroupId = current.premiseGroup?.id;
        if (premiseGroupId) {
          const groupItems = groupsByPremiseGroupId.get(premiseGroupId);
          groupItems?.forEach((groupItem) => {
            if (!visited.has(groupItem.id)) {
              queue.push(groupItem);
            }
          });
        }
      }
    }

    if (group.size > 0) {
      groups.push({ items: Array.from(group) });
    }
  }

  // Populate the groupsByPremiseGroupId map
  items.forEach((item) => {
    const premiseGroupId = item.premiseGroup?.id;
    if (premiseGroupId) {
      if (!groupsByPremiseGroupId.has(premiseGroupId)) {
        groupsByPremiseGroupId.set(premiseGroupId, []);
      }
      groupsByPremiseGroupId.get(premiseGroupId).push(item);
    }
  });

  // Iterate over each item and add to the groups if not visited
  items.forEach((item) => {
    if (!visited.has(item.id)) {
      addGroup(item);
    }
  });

  return groups;
};

const itemsGroupedByCoPremises = computed(() => {
  return groupItemsByPremiseGroup(props.node.children);
});

const onFormalFallacySelected = async (fallacy: any) => {
  console.log("Formal fallacy selected:", fallacy);
  if (fallacy && currentDropdownNode.value) {
    await update("nodes", currentDropdownNode.value, {
      formalFallacyBelow: fallacy.label,
    });
    refresh();
    selectedFormalFallacy.value = null; // Reset selection
  }
};
</script>
