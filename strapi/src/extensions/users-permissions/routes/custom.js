module.exports = {
  routes: [
    {
      method: "GET",
      path: "/users/me/sent-requests",
      handler: "user.sentRequests",
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/users/me/received-requests",
      handler: "user.receivedRequests",
      config: {
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/users/me/friends",
      handler: "user.friends",
      config: {
        policies: [],
      },
    },
  ],
};
