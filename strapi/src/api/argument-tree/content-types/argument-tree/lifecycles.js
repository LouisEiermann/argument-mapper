module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;

    if (data.tags.length === 0) {
      const defaultTag = await strapi.entityService.findMany("api::tag.tag", {
        filters: {
          name: {
            $eq: "Miscellaneous",
          },
        },
      });

      data.tags = [defaultTag[0].id];
    }
  },

  async afterDelete() {
    await strapi.entityService.deleteMany("api::node.node", {
      filters: {
        argument: {
          $exists: false,
        },
      },
    });
  },
};
