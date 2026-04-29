const User = require('../models/User');

const updateUserService = async (userId, data) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    user.name = data.name || user.name;
    user.email = data.email || user.email;

    return await user.save();
};

module.exports = {
    updateUserService
};