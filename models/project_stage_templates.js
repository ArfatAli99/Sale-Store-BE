'use strict';
module.exports = (sequelize, DataTypes) => {
  const project_stage_templates = sequelize.define('project_stage_templates', {
    project_template_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    description_arabic:DataTypes.STRING,
    maximum_allowed_percentage: DataTypes.INTEGER,
    status: DataTypes.INTEGER,
    is_default: DataTypes.INTEGER,
    max_allow_pullback: DataTypes.INTEGER,
    sequence: DataTypes.INTEGER,
    is_deleted:DataTypes.INTEGER
  }, {});
  project_stage_templates.associate = function(models) {
    // associations can be defined here
  };
  return project_stage_templates;
};

/**
* @swagger
* components:
*  schemas:
*   project_stage_templates:
*    type: object
*    properties:
*     project_template_id:
*       type: INTEGER
*     name:
*       type: STRING
*     description:
*       type: INTEGER
*     description_arabic:
*       type: STRING
*     maximum_allowed_percentage:
*       type: INTEGER
*     status:
*       type: INTEGER
*     is_default:
*       type: INTEGER
*     max_allow_pullback:
*       type: INTEGER
*     sequence:
*       type: INTEGER
*     is_deleted:
*       type: INTEGER
*/