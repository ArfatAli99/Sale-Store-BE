'use strict';
module.exports = (sequelize, DataTypes) => {
  const project_task_templates = sequelize.define('task_templates_data', {
    template_stage_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    name_arabic: DataTypes.STRING,
    status: DataTypes.INTEGER,
    Type: DataTypes.STRING,
    Type_arabic: DataTypes.STRING,
    Instruction: DataTypes.STRING,
    instruction_arabic: DataTypes.STRING,
    creator: DataTypes.STRING,
    assignee: DataTypes.STRING,
    is_deleted:DataTypes.INTEGER
  }, {});
  project_task_templates.associate = function(models) {
    // associations can be defined here
  };
  return project_task_templates;
};

/**
* @swagger
* components:
*  schemas:
*   task_templates_data:
*    type: object
*    properties:
*     template_stage_id:
*       type: INTEGER
*     name:
*       type: STRING
*     name_arabic:
*       type: STRING
*     status:
*       type: INTEGER
*     Type:
*       type: STRING
*     Type_arabic:
*       type: STRING
*     Instruction:
*       type: STRING
*     instruction_arabic:
*       type: STRING
*     creator:
*       type: STRING
*     assignee:
*       type: STRING
*     is_deleted:
*       type: INTEGER
*/