module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/node-tree',
      handler: 'node-tree.index',
      config: {
        auth: false
      }
    },
  ],
};
