<template>
  <div class="flex justify-center">
    <UCard v-if="data?.user?.questionSession" class="w-fit m-4">
      <template #header>
        <h1>{{ data?.user.questionSession.currentQuestion.content }}</h1>
        <UBadge class="mt-2">{{
          data?.user.questionSession.currentQuestion.fellacyType
        }}</UBadge>
      </template>

      <div
        v-for="answer in data?.user.questionSession.currentQuestion.answers"
        :key="answer"
      >
        <UButton
          color="primary"
          class="mt-4"
          @click="answerQuestion(answer.index)"
          >{{ answer.text }}</UButton
        >
      </div>

      <template #footer>
        <UProgress
          :value="data?.user?.questionSession.currentQuestionIndex * 10"
          indicator
        />
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

const { fetchUser } = useStrapiAuth();
const { create, find } = useStrapi();
const client = useStrapiClient();
const route = useRoute();

const { data, refresh } = useAsyncData("data", async () => {
  const questions = await find("questions", {
    pagination: {
      start: 0,
      limit: 10,
    },
  });

  const user = (await fetchUser()).value;

  if (!user?.questionSession) {
    await create("question-sessions", {
      user: user?.id,
      questions: questions.data.map((e) => {
        return e.id;
      }),
      currentQuestion: questions.data.map((e) => {
        return e.id;
      })[0],
      questionOrder: questions.data.map((question) => question.id),
    });
  }

  return {
    user,
  };
});

const answerQuestion = async (answer: number) => {
  const response = await client("/validate", {
    method: "POST",
    body: {
      sessionId: data.value?.user?.questionSession.id,
      answer: answer,
    },
  });

  refresh();

  if (response === "deleted") {
    console.log("navigate!");
    navigateTo(route.fullPath.substring(0, route.fullPath.lastIndexOf("/")));
  }
};
</script>
