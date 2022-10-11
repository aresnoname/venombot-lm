// Requisita o Sequelize
const Sequelize = require('sequelize');

// Sequilize connection
const db = require('./db');

// Criar tabela dos Grupos
const Admin = db.define('admins', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    group_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    user_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    type_admin: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    who_registered: {
        type: Sequelize.STRING,
        allowNull: false
    }

}, {
    timestamps: false
});

// Função criar ou atualizar quando alguma coluna for modificada
Admin.sync({alter: true});

// Exporta a model
module.exports = Admin;