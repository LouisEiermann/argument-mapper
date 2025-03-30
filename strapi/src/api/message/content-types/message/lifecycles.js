module.exports = {
  async afterCreate(event) {
    const { result } = event;

    // Fetch the newly created message with the necessary associations
    const populatedMessage = await strapi.entityService.findOne(
      "api::message.message", // Replace with your correct message content-type UID
      result.id,
      {
        populate: {
          sender: true,
        },
      }
    );

    console.log(result, populatedMessage);

    strapi.$io._socket.emit("test", populatedMessage);
  },
};
