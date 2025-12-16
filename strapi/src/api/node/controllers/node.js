"use strict";

/**
 * node controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::node.node", ({ strapi }) => ({
  async delete(ctx) {
    const identifier = ctx.params.id;
    const numericId = Number(identifier);

    const filters = Number.isFinite(numericId)
      ? { $or: [{ id: { $eq: numericId } }, { documentId: { $eq: identifier } }] }
      : { documentId: { $eq: identifier } };

    const nodes = await strapi.entityService.findMany("api::node.node", {
      filters,
      populate: {
        premiseGroup: true,
      },
      pagination: { pageSize: 1, page: 1 },
    });

    const node = nodes?.[0];
    if (!node) return ctx.notFound("Node not found.");

    const groupId = node.premiseGroup?.id ?? null;
    if (!groupId) {
      const deleted = await strapi.entityService.delete("api::node.node", node.id);
      return ctx.send(deleted);
    }

    const group = await strapi.entityService.findOne(
      "api::premise-group.premise-group",
      groupId,
      { populate: { nodes: true } },
    );

    const groupNodes = group?.nodes || [];
    await Promise.all(
      groupNodes.map((n) => strapi.entityService.delete("api::node.node", n.id)),
    );
    await strapi.entityService.delete("api::premise-group.premise-group", groupId);

    return ctx.send({ status: "deleted premise group", premiseGroupId: groupId });
  },
}));
