'use strict';
module.exports = (sequelize, DataTypes) => {
  const section_scope_categories = sequelize.define('section_scope_categories', {
    name: DataTypes.STRING,
    name_arabic: DataTypes.STRING
  }, {});
  section_scope_categories.associate = function(models) {
    // associations can be defined here
  };
  return section_scope_categories;
};

/**
* @swagger
* components:
*  schemas:
*   section_scope_categories:
*    type: object
*    properties:
*     name:
*       type: STRING
*     name_arabic:
*       type: STRING
*/