'use strict';
module.exports = (sequelize, DataTypes) => {
  const project_tasks = sequelize.define('project_tasks', {
    stage_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    name_arabic:DataTypes.STRING,
    status: DataTypes.INTEGER,
    type: DataTypes.STRING,
    type_arabic:DataTypes.STRING,
    instruction: DataTypes.STRING,
    instruction_arabic:DataTypes.STRING,
    creator: DataTypes.STRING,
    assignee:DataTypes.STRING,
    is_delete: DataTypes.INTEGER
  }, {});
  project_tasks.associate = function(models) {
    // associations can be defined here
  };
  return project_tasks;
};

/**
* @swagger
* components:
*  schemas:
*   project_tasks:
*    type: object
*    properties:
*     stage_id:
*       type: INTEGER
*     name:
*       type: STRING
*     name_arabic:
*       type: STRING
*     status:
*       type: INTEGER
*       description: 1=>In Tendering( Before Contract is signed ),2=>On Track ( After Contract is signed )
*     type:
*       type: STRING
*       description: Inspection Request, Invoice Payment, Client Approval Request, Custom Request, Quality Concern, Variation Order - Adding Scope, Variation Order - Removal Scope, Contractor Claim
*     Type_arabic:
*       type: STRING
*     instruction:
*       type: STRING
*     instruction_arabic:
*       type: STRING
*     creator:
*       type: STRING
*       description: System,Admin
*     assignee:
*       type: STRING
*       description: Contractor, Client, Consultant
*     is_deleted:
*       type: INTEGER
*/