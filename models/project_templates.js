'use strict';
module.exports = (sequelize, DataTypes) => {
  const project_templates = sequelize.define('project_templates', {
    name: DataTypes.STRING,
    is_active: DataTypes.INTEGER,
    is_delete: DataTypes.INTEGER
  }, {});
  project_templates.associate = function(models) {
    // associations can be defined here
  };
  return project_templates;
};

/**
* @swagger
* components:
*  schemas:
*   project_templates:
*    type: object
*    properties:
*     name:
*       type: STRING
*     is_active:
*       type: INTEGER
*     is_delete:
*       type: INTEGER
*/