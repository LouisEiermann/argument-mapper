module.exports = {
  async index(ctx) {
    return await this.fetchNodeWithchildren(ctx.query.filters.id.$eq);
  },

  async fetchNodeWithchildren(id) {
    const node = await strapi.db.query("api::node.node").findOne({
      where: { id },
      populate: {
        children: {
          populate: {
            owner: {
              populate: ["avatar"],
            },
          },
        },
        owner: {
          populate: ["avatar"],
        },
        parent: {
          populate: {
            owner: {
              populate: ["avatar"],
            },
          },
        },
        sources: true,
        premiseGroup: true,
      },
    });

    if (node.children && node.children.length > 0) {
      const childrenPromises = node.children.map((child) =>
        this.fetchNodeWithchildren(child.id)
      );
      node.children = await Promise.all(childrenPromises);
    }

    return node;
  },
};
