const userServices = require('../services/user.services');

const getAllUser = async (req, res, next) => {
    try{
        const user = req.user;

        const result = await userServices.getAllUsers();
        
        res.status(200).json({
            data: result
        });

    }catch(error){
        next(error)
    }
}

module.exports = {
    getAllUser
}