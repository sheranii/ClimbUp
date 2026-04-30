const { updateUserService, getAllUsersService } = require('../services/userServices');

// PUT /api/users/:id
const updateUser = async (req, res, next) => {
    try {
        const updatedUser = await updateUserService(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: "User updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/users
const getAllUsers = async (req, res, next) => {
    try {
        const users = await getAllUsersService();

        res.status(200).json({
            success: true,
            count: users.length,
            users: users,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { updateUser, getAllUsers };

