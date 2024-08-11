module.exports = {
  async index(ctx) {
    return await this.fetchNodeWithchildren(ctx.request.body);
  },

  async fetchNodeWithchildren(body) {
    if (!body.sessionId || body.answer === undefined) {
      return { error: "Invalid request data" };
    }

    const alreadyExistingSession = await await strapi.db
      .query("api::question-session.question-session")
      .findOne({
        where: {
          id: body.sessionId,
        },
        populate: {
          currentQuestion: {
            include: {
              answers: true,
            },
          },
          user: true,
        },
      });

    if (!alreadyExistingSession || !alreadyExistingSession.currentQuestion) {
      // Handle the case where the session or questions are not found
      return { error: "Question session not found or has no questions" };
    }

    const currentQuestion = alreadyExistingSession.currentQuestion;

    if (
      body.answer ===
      currentQuestion.answers.find(
        (answer) => answer.id === currentQuestion.correctAnswerId
      )?.index
    ) {
      if (alreadyExistingSession.currentQuestionIndex === 10) {
        console.log("question set done!");
        console.log(alreadyExistingSession);
        const userProgress = await strapi.db
          .query("api::user-progress.user-progress")
          .findOne({
            where: {
              user: alreadyExistingSession?.user.id,
            },
          });

        await strapi.db.query("api::user-progress.user-progress").update({
          where: {
            user: alreadyExistingSession?.user.id,
          },
          data: {
            experience: userProgress.experience + 10,
          },
        });

        await strapi.db.query("api::question-session.question-session").delete({
          where: {
            user: alreadyExistingSession?.user.id,
          },
        });

        return "deleted";
      }
      console.log("correct!");
      const nextQuestionId =
        alreadyExistingSession.questionOrder[
          alreadyExistingSession.currentQuestionIndex++
        ];

      const nextQuestion = await strapi.db
        .query("api::question.question")
        .findOne({
          where: {
            id: nextQuestionId,
          },
        });

      const updatedSession = await strapi.db
        .query("api::question-session.question-session")
        .update({
          where: {
            id: body.sessionId,
          },
          data: {
            currentQuestion: {
              connect: {
                id: nextQuestion?.id,
              },
            },
            currentQuestionIndex: alreadyExistingSession.currentQuestionIndex++,
          },
          populate: {
            currentQuestion: {
              include: {
                answers: true,
              },
            },
          },
        });

      return updatedSession;
    }

    // Handle incorrect answer case
    const updatedQuestionOrder = [...alreadyExistingSession.questionOrder];
    const incorrectlyAnsweredQuestionId = updatedQuestionOrder.splice(
      alreadyExistingSession.currentQuestionIndex,
      1
    )[0];

    updatedQuestionOrder.push(incorrectlyAnsweredQuestionId);

    const nextQuestion = await strapi.db
      .query("api::question.question")
      .findOne({
        where: {
          id: updatedQuestionOrder[alreadyExistingSession.currentQuestionIndex],
        },
      });

    await strapi.db.query("api::question-session.question-session").update({
      where: {
        id: body.sessionId,
      },
      data: {
        currentQuestion: {
          connect: {
            id: nextQuestion?.id,
          },
        },
        questionOrder: updatedQuestionOrder,
      },
      populate: {
        currentQuestion: {
          include: {
            answers: true,
          },
        },
      },
    });
  },
};
