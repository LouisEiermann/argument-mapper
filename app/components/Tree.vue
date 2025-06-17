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
        'shadow-[5px_5px_5px_rgb(239,68,68)]': node.SoundnessDoubted,
        'opacity-50': isNotValid,
      }"
      @click="isSlideoverOpen = true"
    >
      <UButton
        v-if="node.owner?.id === ownUser?.id && !node.Thesis"
        class="absolute -top-4 right-4"
        icon="i-heroicons-x-circle-20-solid"
        color="error"
        @click="deleteReason(node?.id)"
      />
      <UButton
        v-if="node.parent"
        class="absolute -top-4 left-[8.5rem]"
        icon="i-heroicons-arrow-up-16-solid"
        @click.stop="ascendLevel(node.parent?.id)"
      />
      <div v-if="node.Thesis" class="badge">Thesis</div>
      <div v-if="node.Axiom" class="badge">Axiom</div>
      <p>{{ node.title }}</p>
    </UCard>
    <UDropdownMenu
      v-if="
        node.children?.length > 0 && !userIsCreator && !node.FormalFellacyBelow
      "
      color="yellow"
      :items="formalFallacies"
      :popper="{ placement: 'bottom-start' }"
      @click="currentDropdownNode = node?.id"
    >
      <UButton
        color="secondary"
        label="Doubt Validity"
        trailing-icon="i-heroicons-chevron-down-20-solid"
      />
    </UDropdownMenu>
    <UButton
      v-else-if="
        !userIsCreator &&
        node.children.length === 0 &&
        node.parent.FormalFellacyBelow
      "
      color="primary"
      @click="markAsValidAgain"
      >Mark as valid again
    </UButton>
    <UButton
      v-if="
        !userIsCreator && node.children.length === 0 && !node.SoundnessDoubted
      "
      color="primary"
      @click="markAsNotSound(node?.id)"
      >Doubt Soundness
    </UButton>
    <UButton
      v-else-if="!userIsCreator && node.children.length === 0"
      color="primary"
      @click="markAsSound(node?.id)"
      >Mark as Sound again
    </UButton>
    <UButton
      v-if="node.owner?.id !== ownUser?.id"
      color="error"
      @click="isOpen = true"
      >Objection</UButton
    >
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
    >
      <UButton
        v-if="node.owner?.id === ownUser?.id"
        class="absolute top-[11.5rem] left-[8.5rem]"
        icon="i-heroicons-plus-circle-16-solid"
      />

      <template #body>
        <div class="space-y-6">
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
        <UButton @click="addReasons(node?.id)">{{
          $t("argument.new.add")
        }}</UButton>
      </template>
    </UModal>
    <UModal
      :description="$t('argument.tagging')"
      :title="$t('argument.tagging')"
      :close="{
        color: 'neutral',
        variant: 'ghost',
        icon: 'i-heroicons-x-mark-20-solid',
      }"
    >
      <UButton
        v-if="node.owner?.id !== ownUser?.id && !node.thesis"
        color="primary"
        >Tagging</UButton
      >
      <template #body>
        <USelectMenu
          v-model="selectedFormalFellacies"
          type="text"
          :options="premiseGroupData?.formalFellacies"
          :placeholder="$t('argument.formalFallacies')"
          multiple
          searchable
          option-attribute="name"
          value-attribute="id"
        />
        <USelectMenu
          v-model="selectedInformalFellacies"
          type="text"
          :options="premiseGroupData?.informalFellacies"
          :placeholder="$t('argument.informalFallacies')"
          multiple
          searchable
          option-attribute="name"
          value-attribute="id"
        />
        <USelectMenu
          v-model="selectedCommonPatterns"
          type="text"
          :options="premiseGroupData?.commonPatterns"
          :placeholder="$t('argument.commonPatterns')"
          multiple
          searchable
          option-attribute="name"
          value-attribute="id"
        />
      </template>

      <template #footer>
        <UButton @click="addPremiseGroupTag(node.premiseGroup.id)">{{
          $t("argument.new.add")
        }}</UButton>
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
        :is-not-valid="node.FormalFellacyBelow || isNotValid"
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
const { t } = useI18n();
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

const createdPremiseId = ref<number | null>(null);
const createdCoPremiseId = ref<number | null>(null);
const createdSecondCoPremiseId = ref<number | null>(null);

const premiseGroupNodes = ref([]);

const { data: premiseGroupData } = useAsyncData(
  "premiseGroupData",
  async () => {
    const premiseGroupTags = (await find("premise-group-tags")).data;

    const formalFellacies = computed(() => {
      return premiseGroupTags
        .filter((premiseGroupTag) => premiseGroupTag.type === "formalFellacy")
        .map(({ id, attributes }) => ({ id, ...attributes }));
    });

    const informalFellacies = computed(() => {
      return premiseGroupTags
        .filter((premiseGroupTag) => {
          return premiseGroupTag.type === "informalFellacy";
        })
        .map(({ id, attributes }) => ({ id, ...attributes }));
    });

    const commonPatterns = computed(() => {
      return premiseGroupTags
        .filter((premiseGroupTag) => {
          return premiseGroupTag.type === "commonPattern";
        })
        .map(({ id, attributes }) => ({ id, ...attributes }));
    });

    return {
      premiseGroupTags,
      formalFellacies,
      informalFellacies,
      commonPatterns,
    };
  }
);

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
  await update("premise-groups", premiseGroup, {
    premiseGroupTags: [
      ...selectedFormalFellacies.value,
      ...selectedInformalFellacies.value,
      ...selectedCommonPatterns.value,
    ],
  });

  refresh();
  isTaggingOpen.value = false;
};

const deleteReason = async (id: string) => {
  await deleteStrapi("nodes", id);
  refresh();
};

const markAsNotSound = async (id: string) => {
  await update("nodes", id, { SoundnessDoubted: true });
  refresh();
};

const markAsSound = async (id: string) => {
  await update("nodes", id, { SoundnessDoubted: false });
  refresh();
};

const markAsValidAgain = async () => {
  await update("nodes", props.parent.id, {
    FormalFellacyBelow: "",
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

const formalFallacies = [
  [
    {
      label: "Affirming the Consequent",
      click: async () => {
        await update("nodes", currentDropdownNode.value, {
          FormalFellacyBelow: "Affirming the Consequent",
        });
        refresh();
      },
    },
    {
      label: "Denying the Antecedent",
      click: async () => {
        await update("nodes", currentDropdownNode.value, {
          FormalFellacyBelow: "Denying the Antecedent",
        });
        refresh();
      },
    },
  ],
  [
    {
      label:
        "Affirmative Conclusion from a Negative Premise (Illicit Negative)",
      click: async () => {
        await update("nodes", currentDropdownNode.value, {
          FormalFellacyBelow:
            "Affirmative Conclusion from a Negative Premise (Illicit Negative)",
        });
        refresh();
      },
    },
    {
      label:
        "Negative Conclusion from Affirmative Premises (Illicit Affirmative)",
      click: async () => {
        await update("nodes", currentDropdownNode.value, {
          FormalFellacyBelow:
            "Negative Conclusion from Affirmative Premises (Illicit Affirmative)",
        });
        refresh();
      },
    },
  ],
  [
    {
      label: "Undistributed Middle",
      click: async () => {
        await update("nodes", currentDropdownNode.value, {
          FormalFellacyBelow: "Undistributed Middle",
        });
        refresh();
      },
    },
    {
      label: "Illicit Major",
      click: async () => {
        await update("nodes", currentDropdownNode.value, {
          FormalFellacyBelow: "Illicit Major",
        });
        refresh();
      },
    },
    {
      label: "Illicit Minor",
      click: async () => {
        await update("nodes", currentDropdownNode.value, {
          FormalFellacyBelow: "Illicit Minor",
        });
        refresh();
      },
    },
  ],
  [
    {
      label:
        "Fallacy of Exclusive Premises (Drawing an Affirmative Conclusion from Negative Premises)",
      click: async () => {
        await update("nodes", currentDropdownNode.value, {
          FormalFellacyBelow:
            "Fallacy of Exclusive Premises (Drawing an Affirmative Conclusion from Negative Premises)",
        });
        refresh();
      },
    },
    {
      label: "Existential Fallacy",
      click: async () => {
        await update("nodes", currentDropdownNode.value, {
          FormalFellacyBelow: "Existential Fallacy",
        });
        refresh();
      },
    },
  ],
  [
    {
      label: "Fallacy of Four Terms (Quaternio Terminorum)",
      click: async () => {
        await update("nodes", currentDropdownNode.value, {
          FormalFellacyBelow: "Fallacy of Four Terms (Quaternio Terminorum)",
        });
        refresh();
      },
    },
    {
      label: "Fallacy of the Undistributed Middle (Infima Species)",
      click: async () => {
        await update("nodes", currentDropdownNode.value, {
          FormalFellacyBelow:
            "Fallacy of the Undistributed Middle (Infima Species)",
        });
        refresh();
      },
    },
    {
      label:
        "Fallacy of Illicit Process (Fallacy of the Illicit Major/Minor Term)",
      click: async () => {
        await update("nodes", currentDropdownNode.value, {
          FormalFellacyBelow:
            "Fallacy of Illicit Process (Fallacy of the Illicit Major/Minor Term)",
        });
        refresh();
      },
    },
  ],
  [
    {
      label: "Modal Fallacy",
      click: async () => {
        await update("nodes", currentDropdownNode.value, {
          FormalFellacyBelow: "Modal Fallacy",
        });
        refresh();
      },
    },
  ],
];
</script>
