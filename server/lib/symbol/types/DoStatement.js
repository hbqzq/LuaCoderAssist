'use strict';

var utils = require('../utils');

exports.parse = (walker, node, container, scope, parentSymbol, isDef) => {
    node.body && walker.walkNodes(node.body, container, utils.loc2Range(node.loc), parentSymbol, isDef);
}