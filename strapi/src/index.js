"use strict";

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap(/*{ strapi }*/) {
    // Siehe: https://forum.strapi.io/t/how-can-i-create-user-lifecycle-hooks-in-v4/13144
    strapi.db.lifecycles.subscribe({
      models: ["plugin::users-permissions.user"],

      async afterCreate(event) {
        const { result } = event;

        const userId = result.id;

        try {
          await strapi.entityService.create(
            "api::user-progress.user-progress",
            {
              data: {
                user: userId,
                stage: 0,
                level: 0,
                completed: false,
              },
            }
          );
        } catch (error) {
          console.error("Error creating userProgress:", error);
        }
      },
    });
  },
};
