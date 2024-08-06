import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::node.node-tree",
  ({ strapi }) => ({
    async findChildren(ctx) {
      try {
        const centralClaimId = ctx.params.id;
        const level = ctx.query.level || 1;

        // Fetch the central claim
        const centralClaim = await strapi.services['central-claims'].findOne({
          id: centralClaimId
        });

        if (!centralClaim) {
          return ctx.throw(404, 'Central claim not found');
        }

        // Fetch children claims recursively
        const children = await fetchChildrenRecursive(centralClaim, level);

        ctx.send(children);
      } catch (error) {
        console.error('Error fetching children claims:', error);
        ctx.throw(500, 'Internal server error');
      }
    }
  })
);

async function fetchChildrenRecursive(claim, level) {
  if (level === 0) {
    return [];
  }

  const children = await strapi.services['central-claims'].find({
    where: { parentId: claim.id }
  });

  const promises = children.map(async (child) => {
    const grandchildren = await fetchChildrenRecursive(child, level - 1);
    return { ...child, children: grandchildren };
  });

  return await Promise.all(promises);
}
