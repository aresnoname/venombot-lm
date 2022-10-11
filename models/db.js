require('dotenv').config();
const Sequelize = require('sequelize');

// Conexão com o banco de dados!
const connect = new Sequelize(
    process.env.DATABASE, 
    process.env.USER,
    process.env.PASSWORD, {
    host: process.env.HOST,
    dialect: process.env.DATABASE_TYPE
});

module.exports = connect;

// Teste se está funcionando
// (Remover quando for para produção)
//connect.authenticate().then((result) => {console.log('Result: ', result)}).catch((error) => {console.log('Error: ', error)});