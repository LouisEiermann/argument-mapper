
module.exports = {
  routes: [
    {
      method: 'GET',
      path: 'node-tree',
      handler: 'api::node.node-tree.findChildren',
      config: {
        auth: false
      }
    },
  ],
};
