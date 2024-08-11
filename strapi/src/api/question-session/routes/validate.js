module.exports = {
  routes: [
    {
      method: "POST",
      path: "/validate",
      handler: "validate.index",
      config: {
        auth: false,
      },
    },
  ],
};
