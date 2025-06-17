<template>
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <div v-if="!data" class="flex justify-center items-center min-h-[200px]">
      <UIcon name="loading" class="spin size-6" />
    </div>
    <div
      v-else-if="!data.argumentTrees?.length"
      class="flex justify-center items-center min-h-[200px]"
    >
      <p>{{ $t("general.nothingHere") }}</p>
    </div>
    <div v-else class="space-y-6">
      <!-- Header Section -->
      <div class="flex gap-6 items-start">
        <div class="relative w-[200px] flex-shrink-0">
          <img
            class="rounded-md w-full aspect-square object-cover"
            :src="
              useStrapiMedia(data.argumentTrees[0]?.tags[0]?.defaultMood?.url)
            "
          />
          <div class="absolute bottom-2 left-2 space-x-1">
            <UBadge
              v-for="tag of data.argumentTrees[0]?.tags || []"
              :key="tag.id"
              size="sm"
              >{{ localizedVersion("name", tag) }}</UBadge
            >
            <UBadge
              color="error"
              size="sm"
              v-if="data.argumentTrees[0]?.finished"
              >{{ $t("argument.closed") }}</UBadge
            >
          </div>
        </div>
        <UCard class="flex-grow">
          <template #header>
            <h1 class="text-2xl font-semibold">
              {{ data.argumentTrees[0]?.title }}
            </h1>
          </template>
          <p class="text-gray-600 dark:text-gray-400">
            {{ data.argumentTrees[0]?.description }}
          </p>
          <template #footer v-if="!data.argumentTrees[0]?.finished">
            <div class="flex gap-4">
              <UButton size="sm" @click="isOpen = true">
                {{ $t("account.settings") }}
              </UButton>
              <UButton
                size="sm"
                color="error"
                v-if="
                  data.userIsCreator || data.argumentTrees[0]?.opponentAccepted
                "
                @click="finishArgumentModalIsOpen = true"
              >
                {{ $t("argument.endArgument") }}
              </UButton>
            </div>
          </template>
        </UCard>
      </div>

      <!-- Progress Bar -->
      <UProgress
        v-if="data.argumentTrees[0]?.opponent && data.votes"
        :value="useVoteCalculator(data?.votes).creatorPercentage"
        class="max-w-2xl mx-auto"
      />

      <!-- Participants Section -->
      <UCard v-if="data.argumentTrees[0]?.opponent" class="max-w-2xl mx-auto">
        <div class="flex items-center justify-between gap-8">
          <div class="flex flex-col items-center space-y-2">
            <UAvatar
              v-if="data.argumentTrees[0]?.creator?.avatar?.url"
              :src="useStrapiMedia(data.argumentTrees[0]?.creator?.avatar?.url)"
              size="lg"
            />
            <UAvatar
              v-else
              :src="null"
              :alt="data.argumentTrees[0]?.opponent?.username"
              size="lg"
            />
            <p class="font-medium">
              {{ data.argumentTrees[0]?.creator?.username }}
            </p>
            <UButton
              size="sm"
              @click="vote('creator')"
              v-if="!data?.userIsCreator && !data?.userIsOpponent"
            >
              {{ $t("general.vote") }}
            </UButton>
          </div>

          <div class="text-gray-400 font-medium">vs</div>

          <div class="flex flex-col items-center space-y-2">
            <UAvatar
              v-if="data.argumentTrees[0]?.opponent?.avatar?.url"
              :src="
                useStrapiMedia(data.argumentTrees[0]?.opponent?.avatar?.url)
              "
              size="lg"
            />
            <UAvatar
              v-else
              :src="null"
              :alt="data.argumentTrees[0]?.opponent?.username"
              size="lg"
            />
            <p class="font-medium">
              {{ data.argumentTrees[0]?.opponent?.username }}
            </p>
            <UButton
              size="sm"
              @click="vote('opponent')"
              v-if="!data?.userIsCreator && !data?.userIsOpponent"
            >
              {{ $t("general.vote") }}
            </UButton>
          </div>
        </div>
      </UCard>

      <!-- Tree Component -->
      <div class="max-w-4xl mx-auto">
        <Tree
          v-if="data?.nodeTree"
          :node="
            findNodeByIdAtLevel(data.nodeTree, currentLevel) || data.nodeTree
          "
          :user-is-creator="data?.userIsCreator"
          :parent="
            findNodeByIdAtLevel(data.nodeTree.children, currentLevel) ||
            data.argumentTrees[0]?.parent
          "
          :whole-tree="data.nodeTree"
          :argument="data.argumentTrees[0]"
        />
      </div>
    </div>

    <!-- Modals -->
    <UModal v-model="isOpen">
      <UCard
        :ui="{
          ring: '',
          divide: 'divide-y divide-gray-100 dark:divide-gray-800',
        }"
      >
        <template #header>
          <div class="flex justify-between items-center">
            <h1 class="text-lg font-medium">{{ $t("account.settings") }}</h1>
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="isOpen = false"
            />
          </div>
        </template>
        <div class="space-y-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ $t("argument.new.addSource") }}
          </p>
          <input type="file" @change="handleFileChange" class="w-full" />
        </div>
      </UCard>
    </UModal>

    <UModal v-model="finishArgumentModalIsOpen">
      <UCard
        :ui="{
          ring: '',
          divide: 'divide-y divide-gray-100 dark:divide-gray-800',
        }"
      >
        <template #header>
          <div class="flex justify-between items-center">
            <h1 class="text-lg font-medium">
              {{ $t("argument.endArgument") }}
            </h1>
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="finishArgumentModalIsOpen = false"
            />
          </div>
        </template>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ $t("argument.endArgumentConfirm") }}
        </p>
        <template #footer>
          <UButton
            color="error"
            size="sm"
            @click="onArgumentFinishRequest"
            :disabled="
              data.argumentTrees[0]?.userRequestingFinish?.id === data?.user?.id
            "
          >
            {{ $t("argument.iWantToEndArgument") }}
          </UButton>
        </template>
      </UCard>
    </UModal>
  </div>
</template>
<script setup lang="ts">
interface ArgumentTreeData {
  id: number;
  title: string;
  description: string;
  finished: boolean;
  opponentAccepted: boolean;
  parent?: number;
  creator: {
    id: number;
    username: string;
    avatar: {
      url: string;
    };
  };
  opponent: {
    id: number;
    username: string;
    avatar: {
      url: string;
    };
  };
  nodes: Array<{
    id: number;
  }>;
  tags: Array<{
    id: number;
    name: string;
    defaultMood: {
      url: string;
    };
  }>;
  userRequestingFinish: {
    id: number;
  };
}

interface StrapiResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

definePageMeta({
  middleware: "auth",
});

const { find, delete: strapiDelete, create, update } = useStrapi();
const { params } = useRoute();
const client = useStrapiClient();
const userStore = useUserStore();

const toast = useToast();
const { t } = useI18n();
const route = useRoute();
const currentLevel = computed(() => Number(route.query.level) || 1);
const isOpen = ref(false);
const finishArgumentModalIsOpen = ref(false);
const { localizedVersion } = useLocalizedContent();
const { fetchUser } = useStrapiAuth();

const { data, refresh } = await useAsyncData("data", async () => {
  try {
    const response = await find<StrapiResponse<ArgumentTreeData>>(
      "argument-trees",
      {
        populate: {
          nodes: true,
          creator: { populate: ["avatar"] },
          opponent: { populate: ["avatar"] },
          tags: {
            populate: ["defaultMood", "localizations"],
          },
          userRequestingFinish: true,
        },
        filters: {
          id: {
            $eq: params.id,
          },
        },
      }
    );

    if (!response.data?.length) {
      return null;
    }

    const argumentTree = response.data[0];
    const user = await fetchUser();

    console.log("User:", user.value);

    const nodeTree = await find("node-tree", {
      filters: {
        id: {
          $eq: argumentTree.nodes[0].id,
        },
      },
    });

    const votes = await find("votes", {
      filters: {
        argumentTree: {
          $eq: argumentTree.id,
        },
      },
    });

    const userIsCreator = computed(() => {
      return user?.value?.id === argumentTree?.creator?.id;
    });

    const userIsOpponent = computed(() => {
      return user?.value?.id === argumentTree?.opponent?.id;
    });

    return {
      argumentTrees: response.data,
      nodeTree,
      votes,
      userIsCreator,
      userIsOpponent,
      user,
    };
  } catch (error) {
    console.error("Error fetching argument data:", error);
    return null;
  }
});

provide("refresh", refresh);

const handleFileChange = async (event) => {
  const formData = new FormData();

  formData.append("files", event.target.files[0]);
  formData.append("ref", "api::argument-tree.argument-tree");
  formData.append("refId", params.id);
  formData.append("field", "mood");

  await client("/upload", {
    method: "POST",
    body: formData,
  });
  refresh();
};

const onArgumentFinishRequest = async () => {
  if (
    data.value?.argumentTrees[0]?.userRequestingFinish?.id &&
    data.value?.argumentTrees[0]?.userRequestingFinish?.id !=
      data.value?.user?.id
  ) {
    await update("argument-trees", data.value?.argumentTrees[0].id, {
      finished: true,
    });
    toast.add({ title: t("notification.argumentFinished") });
  } else {
    await update("argument-trees", data.value?.argumentTrees[0].id, {
      userRequestingFinish: data.value?.user.id,
    });
  }

  await navigateTo("/account");
};

const findNodeByIdAtLevel = (node, targetId) => {
  if (node?.id === targetId) {
    return node;
  }

  if (!node?.children || node.children?.length === 0) {
    return null;
  }

  for (let child of node?.children) {
    const found = findNodeByIdAtLevel(child, targetId);
    if (found) {
      return found;
    }
  }

  return null;
};

const vote = async (votedFor: string) => {
  const argumentTree = data.value?.argumentTrees[0]?.id;
  await create("votes", {
    castBy: data.value?.user?.id,
    argumentTree: argumentTree,
    for: votedFor,
  });
};
</script>
