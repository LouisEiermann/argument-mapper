module.exports = () => ({
  io: {
    enabled: true,
    config: {
      contentTypes: ["api:message.message"],
      events: [
        {
          name: "connection",
          handler: ({ strapi }, socket) => {
            // will log every time a client connects
            strapi.log.info(
              `[io] a new client with id ${socket.id} has connected`
            );
          },
        },
      ],
      socket: {
        serverOptions: {
          cors: {
            origin: ["http://localhost:3000"],
            methods: ["GET", "POST"],
          },
        },
      },
    },
  },
});
