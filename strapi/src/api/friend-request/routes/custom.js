module.exports = {
  routes: [
    {
      method: "POST",
      path: "/friend-requests/send",
      handler: "friend-request.send",
      config: {
        policies: [],
      },
    },
    {
      method: "POST",
      path: "/friend-requests/accept",
      handler: "friend-request.accept",
      config: {
        policies: [],
      },
    },
    {
      method: "POST",
      path: "/friend-requests/reject",
      handler: "friend-request.reject",
      config: {
        policies: [],
      },
    },
  ],
};
