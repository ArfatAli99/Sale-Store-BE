'use strict';
module.exports = (sequelize, DataTypes) => {
  const project_scopes = sequelize.define('project_scopes', {
    scope_description: DataTypes.STRING,
    scope_description_arabic: DataTypes.STRING,
    type: DataTypes.INTEGER,
    group_name: DataTypes.STRING,
    project_question_in_english: DataTypes.STRING,
    project_question_in_arabic: DataTypes.STRING,
    scope_type: DataTypes.INTEGER,
    slug:DataTypes.STRING,
    is_deleted: DataTypes.INTEGER
  }, {});
  project_scopes.associate = function(models) {
    // associations can be defined here
  };
  return project_scopes;
};

/**
* @swagger
* components:
*  schemas:
*   project_scopes:
*    type: object
*    properties:
*     scope_description:
*       type: STRING
*     scope_description_arabic:
*       type: STRING
*     type:
*       type: INTEGER
*     group_name:
*       type: STRING
*     project_question_in_english:
*       type: STRING
*     project_question_in_arabic:
*       type: STRING
*     scope_type:
*       type: INTEGER
*     slug:
*       type: STRING
*     is_deleted:
*       type: INTEGER
*/