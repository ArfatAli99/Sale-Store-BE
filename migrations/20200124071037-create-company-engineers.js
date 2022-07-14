'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('company_engineers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      cv: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.STRING
      },
      linkedIn_profile: {
        type: Sequelize.STRING
      },
      facebook_profile: {
        type: Sequelize.STRING
      },
      instagram_profile: {
        type: Sequelize.STRING
      },
      is_deleted: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('company_engineers');
  }
};