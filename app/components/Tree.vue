<template>
  <div
    v-if="minimapType && minimapType !== 'none'"
    class="flex flex-col items-center relative min-h-[368px] min-w-[664px] justify-center m-8"
  >
    <Minimap v-if="minimapType === 'visual'" :node="wholeTree" />
    <ArgumentTreeView v-if="minimapType === 'tree'" :node="wholeTree" />
  </div>
  <div
    class="flex flex-col items-center relative min-h-[368px] min-w-[664px] justify-center m-8"
  >
    <UCard
      class="w-[300px] h-[200px] relative mb-8 !overflow-visible"
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
        @click.stop="deleteReason(node)"
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
        :items="formalFallacySelectItems"
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
      <UButton v-if="node.owner?.id !== ownUser?.id" class="mt-2" color="error"
        >{{ $t("argument.objection.add") }}
      </UButton>
      <UButton v-else class="mt-2" color="primary">{{ $t("argument.support.add") }}</UButton>

      <template #body>
        <div class="space-y-6 flex flex-col">
          <UInput
            v-model="premise"
            type="text"
            :placeholder="$t('argument.new.premise')"
          />
          <UInput
            v-model="coPremise"
            type="text"
            :placeholder="$t('argument.new.coPremise')"
          />
        </div>
      </template>

      <template #footer>
        <UButton
          v-if="node.owner?.id !== ownUser?.id"
          @click="addReasons(node?.id)"
          :disabled="!canAddReasons"
          color="error"
          >{{ $t("argument.objection.add") }}</UButton
        >
        <UButton v-else @click="addReasons(node?.id)" :disabled="!canAddReasons">{{
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
      v-model:open="isTaggingOpen"
    >
      <UButton
        v-if="node.owner?.id !== ownUser?.id && !node.thesis"
        color="primary"
        @click="openTaggingModal"
        class="mt-2"
        >{{ $t("argument.tagging.title") }}</UButton
      >
      <template #body>
        <div class="flex flex-col gap-4">
          <USelectMenu
            v-model="selectedFormalFellacies"
            type="text"
            :items="formalFallacyTagItemsWithLegacy"
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
          :disabled="!taggingIsDirty"
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
      class="flex justify-center relative w-full min-w-0"
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
  "minimapType",
]);

const { create, delete: deleteStrapi, update, find } = useStrapi();
const isOpen = ref(false);
	const isTaggingOpen = ref(false);
	const isSlideoverOpen = ref(false);
	const currentDropdownNode = ref();
	const route = useRoute();
	const currentLevel = computed(() => Number(route.query.level) || 1);
	const { t } = useI18n();
	const { fetchUser } = useStrapiAuth();
	const ownUser = await fetchUser();
	const refresh = inject("refresh");

	const premise = ref("");
	const coPremise = ref("");
	const canAddReasons = computed(() => {
	  return premise.value.trim().length > 0 && coPremise.value.trim().length > 0;
	});

	const selectedFormalFellacies = ref([]);
	const selectedInformalFellacies = ref([]);
	const selectedCommonPatterns = ref([]);
	const selectedFormalFallacy = ref(null);

	const { data: premiseGroupData } = useAsyncData(
	  "premiseGroupData",
	  async () => {
	    const premiseGroupTags = (
	      await find("premise-group-tags", {
	        pagination: { pageSize: 1000 },
	        fields: ["id", "name", "type", "key", "documentId", "locale"],
	      })
	    ).data;
	    return { premiseGroupTags };
	  }
	);

	const SYLLOGISM_FORMAL_FALLACY_KEYS = [
	  "four_terms",
	  "undistributed_middle",
	  "illicit_major",
	  "illicit_minor",
	  "exclusive_premises",
	  "illicit_negative",
	  "illicit_affirmative",
	  "existential_fallacy",
	] as const;

	const premiseGroupTagValue = (tag: any) => {
	  const value = tag?.id ?? null;
	  if (value === null || value === undefined) return null;
	  const num = Number(value);
	  return Number.isFinite(num) ? num : null;
	};

	const formalFallacyTagItems = computed(() => {
	  const premiseGroupTags = premiseGroupData.value?.premiseGroupTags || [];
	  const byKey = new Map(
	    premiseGroupTags
	      .filter((tag: any) => tag.type === "formalFallacy" && tag.key)
	      .map((tag: any) => [tag.key, tag])
	  );

	  return SYLLOGISM_FORMAL_FALLACY_KEYS.map((key) => {
	    const tag = byKey.get(key);
	    if (!tag) return null;

	    return {
	      label: t(`argument.formalFallacyLabels.${key}`),
	      value: premiseGroupTagValue(tag),
	      key,
	    };
	  }).filter(Boolean);
	});

	const formalFallacyTagItemsWithLegacy = formalFallacyTagItems;

	const formalFallacySelectItems = computed(() => {
	  return SYLLOGISM_FORMAL_FALLACY_KEYS.map((key) => ({
	    label: t(`argument.formalFallacyLabels.${key}`),
	    value: key,
	  }));
	});

	const informalFellacies = computed(() => {
	  if (!premiseGroupData.value?.premiseGroupTags) return [];

	  return premiseGroupData.value.premiseGroupTags
	    .filter((tag: any) => tag.type === "informalFallacy")
	    .map((tag: any) => ({
	      label: tag.name,
	      value: premiseGroupTagValue(tag),
	    }));
	});

	const commonPatterns = computed(() => {
	  if (!premiseGroupData.value?.premiseGroupTags) return [];

	  return premiseGroupData.value.premiseGroupTags
	    .filter((tag: any) => tag.type === "commonPattern")
	    .map((tag: any) => ({
	      label: tag.name,
	      value: premiseGroupTagValue(tag),
	    }));
	});

	const validPremiseGroupTagIds = computed(() => {
	  const values = [
	    ...formalFallacyTagItemsWithLegacy.value.map((i: any) => i.value),
	    ...informalFellacies.value.map((i: any) => i.value),
	    ...commonPatterns.value.map((i: any) => i.value),
	  ].filter(Boolean);
	  return new Set(values);
	});

	const currentPremiseGroupTagIds = computed(() => {
	  const selectedIds = [
	    ...selectedFormalFellacies.value.map((item: any) => item.value),
	    ...selectedInformalFellacies.value.map((item: any) => item.value),
	    ...selectedCommonPatterns.value.map((item: any) => item.value),
	  ]
	    .map((value: any) => Number(value))
	    .filter((value: number) => Number.isFinite(value))
	    .filter((value: number) => validPremiseGroupTagIds.value.has(value));

	  return Array.from(new Set(selectedIds));
	});

	const initialPremiseGroupTagIds = ref<string[]>([]);

	const taggingIsDirty = computed(() => {
	  const a = new Set(initialPremiseGroupTagIds.value);
	  const b = new Set(currentPremiseGroupTagIds.value);
	  if (a.size !== b.size) return true;
	  for (const id of a) {
	    if (!b.has(id)) return true;
	  }
	  return false;
	});

	const syncTaggingSelectionsFromNode = () => {
	  const existing = props.node?.premiseGroup?.premiseGroupTags || [];

	  const formalExisting = existing
	    .filter((tag: any) => tag.type === "formalFallacy")
	    .map(premiseGroupTagValue);
	  const informalExisting = existing
	    .filter((tag: any) => tag.type === "informalFallacy")
	    .map(premiseGroupTagValue);
	  const commonExisting = existing
	    .filter((tag: any) => tag.type === "commonPattern")
	    .map(premiseGroupTagValue);

	  selectedFormalFellacies.value = formalFallacyTagItemsWithLegacy.value.filter((item: any) =>
	    formalExisting.includes(item.value)
	  );
	  selectedInformalFellacies.value = informalFellacies.value.filter((item: any) =>
	    informalExisting.includes(item.value)
	  );
	  selectedCommonPatterns.value = commonPatterns.value.filter((item: any) =>
	    commonExisting.includes(item.value)
	  );

	  initialPremiseGroupTagIds.value = currentPremiseGroupTagIds.value;
	};

	const openTaggingModal = () => {
	  isTaggingOpen.value = true;
	  syncTaggingSelectionsFromNode();
	};

	watch(
	  () => [isTaggingOpen.value, premiseGroupData.value?.premiseGroupTags],
	  ([open]) => {
	    if (!open) return;
	    syncTaggingSelectionsFromNode();
	  }
	);

	const addReasons = async (parentId: any) => {
	  if (!canAddReasons.value) return;
	
	  const createdPremise = await create("nodes", {
	    title: premise.value.trim(),
	    parent: parentId,
	    owner: ownUser.value?.id,
	    argument: props.argument.id,
	  });

	  const createdCoPremise = await create("nodes", {
	    title: coPremise.value.trim(),
	    parent: parentId,
	    owner: ownUser.value?.id,
	    argument: props.argument.id,
	  });

		  await create("premise-groups", {
		    nodes: [
		      createdPremise.data.documentId ?? createdPremise.data.id,
		      createdCoPremise.data.documentId ?? createdCoPremise.data.id,
		    ],
		  });

	  premise.value = "";
	  coPremise.value = "";
	  refresh();
	  isOpen.value = false;
	};

	const addPremiseGroupTag = async (premiseGroup: string) => {
	  await update("premise-groups", premiseGroup, {
	    premiseGroupTags: currentPremiseGroupTagIds.value,
	  });

	  refresh();
	  isTaggingOpen.value = false;
	};

const { deletePremiseGroupForNode } = usePremiseGroupDeletion();

const deleteReason = async (node: any) => {
  await deletePremiseGroupForNode(node);
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
	    const selectedKey =
	      typeof fallacy === "string"
	        ? fallacy
	        : (fallacy.value ?? fallacy.key ?? fallacy.label);
	    await update("nodes", currentDropdownNode.value, {
	      formalFallacyBelow: selectedKey,
	    });
	    refresh();
	    selectedFormalFallacy.value = null; // Reset selection
	  }
	};
</script>
