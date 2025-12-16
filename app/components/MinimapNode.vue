<template>
  <div v-if="node" class="flex flex-col m-2.5">
    <UCard
      :class="{
        'text-yellow-300':
          currentLevel === node.id || (node.thesis && currentLevel === null),
        'bg-red-500': node?.owner.id !== node?.parent?.owner.id && node.parent,
        'bg-primary-500': !(
          node?.owner.id !== node?.parent?.owner.id && node.parent
        ),
        'ring-2': hasAnyTags || !!fallacyKey,
        'ring-red-200': hasFormalTag || !!fallacyKey,
        'ring-yellow-200': hasInformalTag && !(hasFormalTag || !!fallacyKey),
        'ring-sky-200': hasCommonTag && !(hasFormalTag || hasInformalTag || !!fallacyKey),
        'shadow-[0_0_0_3px_rgb(239,68,68)]': hasFormalTag || !!fallacyKey,
        'shadow-[0_0_0_3px_rgb(245,158,11)]': hasInformalTag && !(hasFormalTag || !!fallacyKey),
        'shadow-[0_0_0_3px_rgb(14,165,233)]': hasCommonTag && !(hasFormalTag || hasInformalTag || !!fallacyKey),
        'outline outline-2 outline-yellow-400': !!node.soundnessDoubted,
        'text-white': !(
          currentLevel === node.id ||
          (node.thesis && currentLevel === null)
        ),
        'cursor-pointer relative': true,
        'overflow-visible': true,
      }"
      @click="navigate(node.id)"
    >
      <span>{{ node.title }}</span>
      <div v-if="tagBadges.length" class="mt-1 flex flex-wrap gap-1">
        <UBadge
          v-for="badge in tagBadges"
          :key="badge.key"
          :color="badge.color"
          size="xs"
        >
          {{ badge.label }}
        </UBadge>
      </div>
      <UAvatar
        v-if="node.owner.avatar?.url"
        class="absolute -top-4 right-4"
        :src="useStrapiMedia(node.owner.avatar?.url)"
      />
      <UAvatar
        v-else
        :alt="node.owner.username"
        class="absolute -top-4 right-4"
      />
    </UCard>
    <div
      v-if="node.children && node.children.length > 0"
      class="flex justify-center mt-2.5 pt-2.5 w-full"
    >
      <MinimapNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
});
const route = useRoute();
const currentLevel = computed(() => Number(route.query.level) || null);
const { t } = useI18n();

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

const premiseGroupTags = computed(() => {
  return props.node?.premiseGroup?.premiseGroupTags || [];
});

const hasFormalTag = computed(() => {
  return premiseGroupTags.value.some((tag: any) => tag.type === "formalFallacy");
});

const hasInformalTag = computed(() => {
  return premiseGroupTags.value.some((tag: any) => tag.type === "informalFallacy");
});

const hasCommonTag = computed(() => {
  return premiseGroupTags.value.some((tag: any) => tag.type === "commonPattern");
});

const hasAnyTags = computed(() => {
  return premiseGroupTags.value.length > 0;
});

const fallacyKey = computed(() => {
  const key = props.node?.formalFallacyBelow;
  if (!key || typeof key !== "string") return null;
  return (SYLLOGISM_FORMAL_FALLACY_KEYS as readonly string[]).includes(key)
    ? key
    : null;
});

const tagBadges = computed(() => {
  const badges: Array<{ key: string; label: string; color: any }> = [];

  if (fallacyKey.value) {
    badges.push({
      key: `fallacy:${fallacyKey.value}`,
      label: t(`argument.formalFallacyLabels.${fallacyKey.value}`),
      color: "error",
    });
  }

  // Show up to 2 group tags (in addition to formalFallacyBelow).
  for (const tag of premiseGroupTags.value) {
    if (badges.length >= 3) break;
    const key = tag.key || tag.documentId || tag.id || tag.name;
    if (!key) continue;

    if (tag.type === "formalFallacy" && tag.key) {
      badges.push({
        key: `group:formal:${tag.key}`,
        label: t(`argument.formalFallacyLabels.${tag.key}`),
        color: "error",
      });
      continue;
    }

    const color =
      tag.type === "informalFallacy"
        ? "warning"
        : tag.type === "commonPattern"
          ? "info"
          : "neutral";

    badges.push({
      key: `group:${tag.type}:${key}`,
      label: tag.name,
      color,
    });
  }

  return badges;
});

const navigate = async (id: string) => {
  navigateTo({
    path: "",
    query: {
      level: id,
    },
  });
};
</script>
