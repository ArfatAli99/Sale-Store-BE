'use strict';
module.exports = (sequelize, DataTypes) => {
  const project_consultants = sequelize.define('project_consultants', {
    client_id: DataTypes.INTEGER,
    consultant_id: DataTypes.INTEGER,
    project_id: DataTypes.INTEGER,
    is_active: DataTypes.INTEGER,
    is_delete: DataTypes.INTEGER
  }, {});
  project_consultants.associate = function(models) {
    // associations can be defined here
  };
  return project_consultants;
};

/**
* @swagger
* components:
*  schemas:
*   project_consultants:
*    type: object
*    properties:
*     client_id:
*       type: INTEGER
*     consultant_id:
*       type: INTEGER
*     project_id:
*       type: INTEGER
*     is_active:
*       type: INTEGER
*     is_delete:
*       type: INTEGER
*/