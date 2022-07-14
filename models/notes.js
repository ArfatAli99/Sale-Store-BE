'use strict';
module.exports = (sequelize, DataTypes) => {
  const notes = sequelize.define('notes', {
    notes_holder: DataTypes.TEXT,
    project_id: DataTypes.INTEGER,
    status:DataTypes.INTEGER,
    callback_date: DataTypes.DATE,
    color_tag: DataTypes.STRING
  }, {});
  notes.associate = function(models) {
    // associations can be defined here
  };
  return notes;
};

/**
* @swagger
* components:
*  schemas:
*   notes:
*    type: object
*    properties:
*     notes_holder:
*       type: TEXT
*     project_id:
*       type: INTEGER
*     status:
*       type: INTEGER
*     callback_date:
*       type: DATE
*     color_tag:
*       type: STRING
*/