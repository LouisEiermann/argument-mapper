module.exports = {
  async afterUpdate(event) {
    const { result, params } = event;

    // Check if the friend request status was changed to 'accepted'
    if (result.status === "accepted") {
      const friendRequest = await strapi.entityService.findOne(
        "api::friend-request.friend-request",
        result.id,
        {
          populate: ["sender", "receiver"],
        }
      );

      // Add the receiver to the sender's friends list
      const senderUser = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        friendRequest.sender.id,
        {
          populate: ["friends"],
        }
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
        }
      );

      // Add the sender to the receiver's friends list
      const receiverUser = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        friendRequest.receiver.id,
        {
          populate: ["friends"],
        }
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
        }
      );
    }
  },
};
