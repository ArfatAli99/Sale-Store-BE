'use strict';
module.exports = (sequelize, DataTypes) => {
  const notifications = sequelize.define('notifications', {
    notification_from: DataTypes.INTEGER,
    notification_to: DataTypes.INTEGER,
    project_id: DataTypes.INTEGER,
    title: DataTypes.STRING,
    title_arabic:DataTypes.STRING,
    description_arabic:DataTypes.STRING,
    description: DataTypes.STRING,
    link: DataTypes.STRING,
    notification_type: DataTypes.STRING,
    status: DataTypes.ENUM(0,1),
    is_deleted: DataTypes.ENUM(0,1)
  }, {});
  notifications.associate = function(models) {
    // associations can be defined here
  };
  return notifications;
};

/**
* @swagger
* components:
*  schemas:
*   notifications:
*    type: object
*    properties:
*     notification_from:
*       type: INTEGER
*     notification_to:
*       type: INTEGER
*     project_id:
*       type: INTEGER
*     title:
*       type: STRING
*     title_arabic:
*       type: STRING
*     description_arabic:
*       type: STRING
*     description:
*       type: STRING
*     link:
*       type: STRING
*     notification_type:
*       type: STRING
*     status:
*       type: ENUM
*       enum:
*         - 0
*         - 1
*     is_deleted:
*       type: ENUM
*       enum:
*         - 0
*         - 1
*/