module.exports = {
  async index(ctx) {
    return await this.fetchNodeWithchildren(ctx.query.id);
  },

  async fetchNodeWithchildren(id) {
    console.log(id);
    const node = await strapi.db.query("api::node.node").findOne({
      where: { id },
      populate: ["children", "siblings", "parent", "owner"],
    });
    console.log(node);

    if (node.children && node.children.length > 0) {
      const childrenPromises = node.children.map((child) =>
        this.fetchNodeWithchildren(child.id)
      );
      node.children = await Promise.all(childrenPromises);
    }

    return node;
  },
};
