'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('validations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      phone: {
        type: Sequelize.STRING
      },
      country_code: {
        type: Sequelize.STRING
      },
      uid: {
        type: Sequelize.INTEGER
      },
      otp: {
        type: Sequelize.STRING
      },
      role: {
        type: Sequelize.INTEGER
      },
      validation_type: {
        type: Sequelize.ENUM
      },
      validation_hash: {
        type: Sequelize.STRING
      },
      ref_email: {
        type: Sequelize.STRING
      },
      ref_id: {
        type: Sequelize.INTEGER
      },
      is_expired: {
        type: Sequelize.INTEGER
      },
      is_verified: {
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
    return queryInterface.dropTable('validations');
  }
};