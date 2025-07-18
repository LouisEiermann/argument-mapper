module.exports = {
  async afterUpdate(event) {
    const { result, params } = event;

    // Check if the friend request status was changed to 'accepted'
    if (result.requestStatus === "accepted") {
      const friendRequest = await strapi.entityService.findOne(
        "api::friend-request.friend-request",
        result.id,
        {
          populate: ["sender", "receiver"],
        },
      );

      // Add the receiver to the sender's friends list
      const senderUser = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        friendRequest.sender.id,
        {
          populate: ["friends"],
        },
      );

      await strapi.entityService.update(
        "plugin::users-permissions.user",
        friendRequest.sender.id,
        {
          data: {
            friends: [
              ...senderUser.friends.map((friend) => friend.id),
              friendRequest.receiver.id,
            ],
          },
        },
      );

      // Add the sender to the receiver's friends list
      const receiverUser = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        friendRequest.receiver.id,
        {
          populate: ["friends"],
        },
      );

      await strapi.entityService.update(
        "plugin::users-permissions.user",
        friendRequest.receiver.id,
        {
          data: {
            friends: [
              ...receiverUser.friends.map((friend) => friend.id),
              friendRequest.sender.id,
            ],
          },
        },
      );

      // Check if a chat between these two users already exists
      const existingChat = await strapi.entityService.findMany(
        "api::chat.chat",
        {
          filters: {
            participants: {
              $and: [{ id: senderUser.id }, { id: receiverUser.id }],
            },
          },
        },
      );

      // If no existing chat is found, create a new one
      if (!existingChat || existingChat.length === 0) {
        await strapi.entityService.create("api::chat.chat", {
          data: {
            participants: [senderUser.id, receiverUser.id],
          },
        });
      }
    }
  },
};
