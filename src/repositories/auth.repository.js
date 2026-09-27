const pool = require('../config/db');

const checkUser = async (username) => {
    const query = `SELECT * FROM users WHERE name=$1`
    const response = await pool.query(query, [username]);
    // console.log(response);
    return response.rows;   
}

const userRegister = async (username, password) => {

    const userExists = await checkUser(username);
    
    if(userExists.length > 0){
        throw new Error('User already exists!')
    }

    const query = `INSERT INTO users(name, password) VALUES($1, $2)`;
    const response = await pool.query(query, [username, password]);
    //console.log(response);
    return response;
}

module.exports = {
    checkUser,
    userRegister
}

