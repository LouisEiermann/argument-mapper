<template>
  <div class="argument-container">
    <div class="overview">
      <div class="overview-description">
        <div class="image-container">
          <img
            class="rounded-md"
            :src="
              useStrapiMedia(
                data?.argumentTrees?.data[0].attributes.tags.data[0].attributes
                  .defaultMood.data.attributes.url
              )
            "
          />
          <div class="tags">
            <UBadge
              v-for="tag of data?.argumentTrees?.data[0].attributes.tags.data"
              >{{ localizedVersion("name", tag) }}</UBadge
            >
            <UBadge
              color="red"
              v-if="data?.argumentTrees?.data[0].attributes.finished"
              >Geschlossen</UBadge
            >
          </div>
        </div>
        <UCard>
          <template #header
            ><h1 class="rounded-md">
              {{ data?.argumentTrees?.data[0].attributes.title }}
            </h1>
          </template>
          <p>
            {{ data?.argumentTrees?.data[0].attributes.description }}
          </p>
          <template
            #footer
            v-if="!data?.argumentTrees?.data[0].attributes.finished"
          >
            <div class="footer">
              <UButton class="move-down" @click="isOpen = true"
                >Einstellungen</UButton
              >
              <UButton
                class="end-argument"
                color="red"
                v-if="
                  data?.userIsCreator ||
                  data?.argumentTrees?.data[0].attributes.opponentAccepted
                "
                @click="finishArgumentModalIsOpen = true"
                >Argument beenden</UButton
              >
            </div>
          </template>
        </UCard>
        <UModal v-model="isOpen">
          <UCard
            :ui="{
              ring: '',
              divide: 'divide-y divide-gray-100 dark:divide-gray-800',
            }"
          >
            <template #header>
              <div class="header">
                <h1>Einstellungen</h1>
                <UButton
                  color="neutral"
                  variant="ghost"
                  icon="i-heroicons-x-mark-20-solid"
                  class="-my-1"
                  @click="isOpen = false"
                />
              </div>
            </template>
            <div class="space-y-6">
              Mood Bild ändern:
              <input type="file" @change="handleFileChange" />
            </div>

            <template #footer> test</template>
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
              <div class="header">
                <h1>Argument beenden</h1>
                <UButton
                  color="neutral"
                  variant="ghost"
                  icon="i-heroicons-x-mark-20-solid"
                  class="-my-1"
                  @click="finishArgumentModalIsOpen = false"
                />
              </div>
            </template>
            <p class="space-y-6 text-sm">
              Bekunde deinen Willen, das Argument zu beenden. Stimmt dein
              Partner dem Ende des Arguments zu, wird das Argument als
              geschlossen markiert und Ihr könnt beide nichts mehr daran
              ändern.<br /><br />Geschlossene Argumente können von anderen
              Nutzern bewertet werden.
            </p>

            <template #footer
              ><UButton
                color="red"
                @click="onArgumentFinishRequest"
                :disabled="
                  data.argumentTrees.data[0].attributes.userRequestingFinish
                    .data?.id === data?.user.id
                "
                >Ich will das Argument beenden</UButton
              >
            </template>
          </UCard>
        </UModal>
      </div>
      <UProgress
        v-if="
          data?.argumentTrees?.data[0].attributes.opponent.data && data.votes
        "
        :value="useVoteCalculator(data?.votes).creatorPercentage"
      />
      <UContainer
        class="participants"
        v-if="data?.argumentTrees?.data[0].attributes.opponent.data"
      >
        <div>
          <UAvatar
            v-if="
              data?.argumentTrees?.data[0].attributes.creator.data.attributes
                .avatar.data?.attributes.url
            "
            :src="
              useStrapiMedia(
                data?.argumentTrees?.data[0].attributes.creator.data.attributes
                  .avatar.data?.attributes.url
              )
            "
          />
          <UAvatar
            v-else
            :src="null"
            :alt="
              data?.argumentTrees?.data[0].attributes.opponent.data.attributes
                .username
            "
          />
          <p>
            {{
              data?.argumentTrees?.data[0].attributes.creator.data.attributes
                .username
            }}
          </p>
          <UButton
            @click="vote('creator')"
            v-if="!data?.userIsCreator && !data?.userIsOpponent"
            >Vote</UButton
          >
        </div>
        vs
        <div>
          <UAvatar
            v-if="
              data?.argumentTrees?.data[0].attributes.opponent.data.attributes
                .avatar.data?.attributes.url
            "
            :src="
              useStrapiMedia(
                data?.argumentTrees?.data[0].attributes.opponent.data.attributes
                  .avatar.data?.attributes.url
              )
            "
          />
          <UAvatar
            v-else
            :src="null"
            :alt="
              data?.argumentTrees?.data[0].attributes.opponent.data.attributes
                .username
            "
          />
          <p>
            {{
              data?.argumentTrees?.data[0].attributes.opponent.data?.attributes
                .username
            }}
          </p>
          <UButton
            @click="vote('opponent')"
            v-if="!data?.userIsCreator && !data?.userIsOpponent"
            >Vote</UButton
          >
        </div>
      </UContainer>
    </div>
    <Tree
      v-if="data?.nodeTree"
      :node="findNodeByIdAtLevel(data.nodeTree, currentLevel) || data.nodeTree"
      :user-is-creator="data?.userIsCreator"
      :parent="
        findNodeByIdAtLevel(data.nodeTree.children, currentLevel) ||
        data?.argumentTrees.data[0].attributes.parent
      "
      :whole-tree="data.nodeTree"
      :argument="data?.argumentTrees?.data[0]"
    />
  </div>
</template>
<script setup lang="ts">
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
  const argumentTrees = await find("argument-trees", {
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
  });

  const user = await fetchUser();

  const nodeTree = await find("node-tree", {
    filters: {
      id: {
        $eq: argumentTrees.data[0].attributes.nodes.data[0].id,
      },
    },
  });

  const votes = await find("votes", {
    filters: {
      argumentTree: {
        $eq: argumentTrees.data[0].id,
      },
    },
  });

  const userIsCreator = computed(() => {
    return user.value?.id === argumentTrees.data[0].attributes.creator.data.id;
  });

  const userIsOpponent = computed(() => {
    return (
      user.value?.id === argumentTrees.data[0].attributes.opponent.data?.id
    );
  });

  return {
    argumentTrees,
    nodeTree,
    votes,
    userIsCreator,
    userIsOpponent,
    user,
  };
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
    data.value?.argumentTrees.data[0].attributes.userRequestingFinish.data
      ?.id &&
    data.value?.argumentTrees.data[0].attributes.userRequestingFinish.data
      ?.id != data.value?.user.value?.id
  ) {
    await update("argument-trees", data.value?.argumentTrees.data[0].id, {
      finished: true,
    });
    toast.add({ title: t("notification.argumentFinished") });
  } else {
    await update("argument-trees", data.value?.argumentTrees.data[0].id, {
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
  const argumentTree = data.value?.argumentTrees.data[0].id;
  await create("votes", {
    castBy: data.value?.user.value?.id,
    argumentTree: argumentTree,
    for: votedFor,
  });
};
</script>
<style lang="scss" scoped>
.image-container {
  position: relative;
}

.tags {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;

  & > * {
    margin: 0.2rem;
  }
}

.argument-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  margin-top: 4rem;

  h1 {
    top: 12rem;
    font-size: 1.5rem;
    padding: 0.2rem;
  }

  img {
    width: 300px;
  }
}

.overview {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &-description {
    display: flex;
    gap: 1rem;
  }
}

.end-argument {
  width: fit-content;
}

.header {
  display: flex;
  justify-content: space-between;
}

.footer {
  display: flex;
  gap: 1rem;
}

.participants {
  display: flex;
  align-items: center;

  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 150px;
  }
}
</style>
