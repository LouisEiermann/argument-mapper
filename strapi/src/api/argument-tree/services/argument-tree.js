'use strict';

/**
 * argument-tree service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::argument-tree.argument-tree');
