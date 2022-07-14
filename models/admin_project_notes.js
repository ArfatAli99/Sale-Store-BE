'use strict';
module.exports = (sequelize, DataTypes) => {
  const admin_project_notes = sequelize.define('admin_project_notes', {
    type: DataTypes.INTEGER,
    description: DataTypes.STRING,
    title:DataTypes.STRING,
    project_id: DataTypes.INTEGER
  }, {});
  admin_project_notes.associate = function(models) {
    // associations can be defined here
  };
  return admin_project_notes;
};

/**
* @swagger
* components:
*  schemas:
*   admin_project_notes:
*    type: object
*    properties:
*     type:
*       type: INTEGER
*     description:
*       type: STRING
*     title:
*       type: STRING
*     project_id:
*       type: INTEGER
*/