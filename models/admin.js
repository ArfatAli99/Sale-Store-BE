'use strict';
module.exports = (sequelize, DataTypes) => {
  const admin = sequelize.define('admin', {
    full_name: DataTypes.STRING,
    role: DataTypes.INTEGER,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    is_active: DataTypes.INTEGER,
    is_delete: DataTypes.INTEGER,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {});
  admin.associate = function(models) {
    // associations can be defined here
  };
  return admin;
};

/**
* @swagger
* components:
*  schemas:
*   admin:
*    type: object
*    properties:
*     full_name:
*       type: STRING
*     role:
*       type: INTEGER
*     email:
*       type: STRING
*     password:
*       type: STRING
*     is_active:
*       type: INTEGER
*     is_delete:
*       type: INTEGER
*     createdAt:
*       type: DATE
*     updatedAt:
*       type: DATE
*/