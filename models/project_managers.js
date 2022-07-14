'use strict';
module.exports = (sequelize, DataTypes) => {
  const project_managers = sequelize.define('project_managers', {
    project_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    mobile_no: DataTypes.STRING,
    email: DataTypes.STRING
  }, {});
  project_managers.associate = function(models) {
    // associations can be defined here
  };
  return project_managers;
};

/**
* @swagger
* components:
*  schemas:
*   project_managers:
*    type: object
*    properties:
*     project_id:
*       type: INTEGER
*     name:
*       type: STRING
*     mobile_no:
*       type: STRING
*     email:
*       type: STRING
*/