const userRepository = require('../repositories/user.repository');

const getAllUsers = async () => {
    const result = await userRepository.getAllUsers();
    return result;
}

module.exports = {
    getAllUsers
}