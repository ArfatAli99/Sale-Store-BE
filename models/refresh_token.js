'use strict';
module.exports = (sequelize, DataTypes) => {
  const refresh_token = sequelize.define('refresh_token', {
    kind: DataTypes.ENUM('User', 'Admin'),
    item: DataTypes.INTEGER,
    refreshToken: DataTypes.STRING,
    isExpire: DataTypes.INTEGER,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {});
  refresh_token.associate = function(models) {
    // associations can be defined here
  };
  return refresh_token;
};

/**
* @swagger
* components:
*  schemas:
*   refresh_token:
*    type: object
*    properties:
*     kind:
*       type: ENUM
*       enum:
*         - User
*         - Admin
*     item:
*       type: INTEGER
*     refreshToken:
*       type: STRING
*     isExpire:
*       type: INTEGER
*     createdAt:
*       type: DATE
*     updatedAt:
*       type: DATE
*/