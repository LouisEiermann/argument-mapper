module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;

    console.log(data.tags.set.length);

    if (data.tags.set.length === 0) {
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

  async afterDelete(event) {
    const { result } = event;

    // Find all nodes associated with the deleted argument tree
    const nodes = await strapi.entityService.findMany("api::node.node", {
      filters: {
        argument: result.id,
      },
    });

    // Delete each node individually
    for (const node of nodes) {
      await strapi.entityService.delete("api::node.node", node.id);
    }
  },
};
