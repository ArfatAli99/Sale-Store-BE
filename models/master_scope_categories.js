'use strict';
module.exports = (sequelize, DataTypes) => {
  const master_scope_categories = sequelize.define('master_scope_categories', {
    name: DataTypes.STRING,
    name_arabic: DataTypes.STRING
  }, {});
  master_scope_categories.associate = function(models) {
    // associations can be defined here
  };
  return master_scope_categories;
};

/**
* @swagger
* components:
*  schemas:
*   master_scope_categories:
*    type: object
*    properties:
*     name:
*       type: STRING
*     name_arabic:
*       type: STRING
*/