module.exports = {
  async afterCreate(event) {
    const { result } = event;
    strapi.$io._socket.emit("test", result);
  },
};
