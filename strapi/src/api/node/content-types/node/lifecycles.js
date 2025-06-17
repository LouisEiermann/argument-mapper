"use strict";

/**
 * Lifecycle callbacks for the `node` model.
 */

module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;

    if (data?.parent?.set[0].id) {
      const parentId = data.parent.set[0].id;
      const parent = await strapi.entityService.findOne(
        "api::node.node",
        parentId,
        { fields: ["level"] },
      );
      data.level = parent.level + 1;
    } else {
      data.level = 1; // Root level node
    }
  },
  async beforeUpdate(event) {
    const { data } = event.params;
    if (data?.parent?.set[0].id) {
      const parentId = data.parent.set[0].id;
      const parent = await strapi.entityService.findOne(
        "api::node.node",
        parentId,
        { fields: ["level"] },
      );
      data.level = parent.level + 1;
    }
  },
};
