'use strict';
module.exports = (sequelize, DataTypes) => {
  const task_templates = sequelize.define('task_templates', {
    name: DataTypes.STRING,
    is_active: DataTypes.INTEGER,
    is_delete: DataTypes.INTEGER
  }, {});
  task_templates.associate = function(models) {
    // associations can be defined here
  };
  return task_templates;
};
/**
* @swagger
* components:
*  schemas:
*   task_templates:
*    type: object
*    properties:
*     name:
*       type: STRING
*     is_active:
*       type: INTEGER
*     is_deleted:
*       type: INTEGER
*/