const userRepository = require('../repositories/user.repository');

const getAllUsers = async () => {
    const result = await userRepository.getAllUsers();
    return result;
}

const getUserById = async (userId) => {
    const user = await userRepository.getUserById(userId);
    
    return user;
    
}

module.exports = {
    getAllUsers
}