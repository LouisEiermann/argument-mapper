module.exports = (plugin) => {
  const { errors } = require("@strapi/utils");

  const originalClientServiceFactory = plugin.services.client;

  plugin.services.client = (context) => {
    const service = originalClientServiceFactory(context);
    const originalMarkAsRemovedNested = service.markAsRemovedNested?.bind(service);

    service.markAsRemoved = async (params, userContext) => {
      const { commentId, relation, authorId } = params || {};

      const strapi = context.strapi;
      const authenticatedUserId = userContext?.id != null ? String(userContext.id) : null;
      const unauthenticatedAuthorId = authorId != null ? String(authorId) : null;

      const effectiveAuthorId = authenticatedUserId || unauthenticatedAuthorId;
      const numericCommentId = Number(commentId);
      if (!numericCommentId || !Number.isFinite(numericCommentId) || !relation || !effectiveAuthorId) {
        throw new errors.ValidationError("Invalid delete comment request");
      }

      const existing = await strapi
        .query("plugin::comments.comment")
        .findOne({
          where: { id: numericCommentId, related: relation },
          populate: { authorUser: true, threadOf: true },
        });

      if (!existing) {
        throw new errors.NotFoundError(
          "Entity does not exist or you're not allowed to take an action on it"
        );
      }

      const existingAuthorId = existing.authorId != null ? String(existing.authorId) : null;
      const existingAuthorUserId =
        existing.authorUser?.id != null ? String(existing.authorUser.id) : null;

      const isOwner =
        existingAuthorId === effectiveAuthorId ||
        (authenticatedUserId != null && existingAuthorUserId === authenticatedUserId);

      if (!isOwner) {
        throw new errors.NotFoundError(
          "Entity does not exist or you're not allowed to take an action on it"
        );
      }

      await strapi.query("plugin::comments.comment").update({
        where: { id: numericCommentId, related: relation },
        data: { removed: true },
      });

      if (typeof originalMarkAsRemovedNested === "function") {
        await originalMarkAsRemovedNested(numericCommentId, true);
      }

      // Keep the response shape consistent (plugin returns empty response body on success).
      return {};
    };

    return service;
  };

  return plugin;
};
