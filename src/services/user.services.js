const userRepository = require('../repositories/user.repository');

const getAllUsers = async () => {
    const result = await userRepository.getAllUsers();
    return result;
}

const getUserIsActive = async (username) => {
    return await userRepository.getUserIsActive(username);
}

const getUserById = async (userId) => {
    const user = await userRepository.getUserById(userId);
    
    return user;
}

const updateUserStatus = async (userId, status) => {
    const user = await userRepository.updateUserStatus(userId, status);
    return user;
}

module.exports = {
    getAllUsers,
    updateUserStatus,
    getUserById,
    getUserIsActive
}