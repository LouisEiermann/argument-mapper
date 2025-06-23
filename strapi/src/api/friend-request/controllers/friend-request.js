"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::friend-request.friend-request",
  ({ strapi }) => ({
    async send(ctx) {
      const { id: senderId } = ctx.state.user;
      const { receiverId } = ctx.request.body;

      if (senderId === receiverId) {
        return ctx.badRequest("You cannot send a friend request to yourself.");
      }

      const existingRequest = await strapi.entityService.findMany(
        "api::friend-request.friend-request",
        {
          filters: { sender: senderId, receiver: receiverId },
        },
      );

      if (existingRequest.length > 0) {
        return ctx.badRequest("Friend request already sent.");
      }

      const friendRequest = await strapi.entityService.create(
        "api::friend-request.friend-request",
        {
          data: {
            sender: senderId,
            receiver: receiverId,
            requestStatus: "pending",
          },
        },
      );

      return ctx.send(friendRequest);
    },

    async accept(ctx) {
      const { id } = ctx.params;
      const userId = ctx.state.user.id;

      const friendRequest = await strapi.entityService.findOne(
        "api::friend-request.friend-request",
        id,
        {
          populate: { sender: true, receiver: true },
        },
      );

      if (!friendRequest) {
        return ctx.notFound("Friend request not found.");
      }

      if (friendRequest.receiver.id !== userId) {
        return ctx.unauthorized("You cannot accept this friend request.");
      }

      await strapi.entityService.update(
        "api::friend-request.friend-request",
        id,
        {
          data: {
            requestStatus: "accepted",
            responseAt: new Date(),
          },
        },
      );

      await strapi.entityService.update(
        "plugin::users-permissions.user",
        friendRequest.sender.id,
        {
          data: {
            friends: [
              ...friendRequest.sender.friends,
              friendRequest.receiver.id,
            ],
          },
        },
      );

      await strapi.entityService.update(
        "plugin::users-permissions.user",
        friendRequest.receiver.id,
        {
          data: {
            friends: [
              ...friendRequest.receiver.friends,
              friendRequest.sender.id,
            ],
          },
        },
      );

      return ctx.send({ status: "Friend request accepted." });
    },

    async reject(ctx) {
      const { id } = ctx.params;
      const userId = ctx.state.user.id;

      const friendRequest = await strapi.entityService.findOne(
        "api::friend-request.friend-request",
        id,
        {
          populate: { sender: true, receiver: true },
        },
      );

      if (!friendRequest) {
        return ctx.notFound("Friend request not found.");
      }

      if (friendRequest.receiver.id !== userId) {
        return ctx.unauthorized("You cannot reject this friend request.");
      }

      await strapi.entityService.update(
        "api::friend-request.friend-request",
        id,
        {
          data: {
            requestStatus: "rejected",
            responseAt: new Date(),
          },
        },
      );

      return ctx.send({ status: "Friend request rejected." });
    },
  }),
);
