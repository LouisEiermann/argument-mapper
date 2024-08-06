'use strict';

/**
 * argument-tree router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::argument-tree.argument-tree');
