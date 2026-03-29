const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const auth0 = require('../middleware/auth0');

exports.getCurrentUser = catchAsync(async (req, res, next) => {
    const externalId = req.auth.payload.sub;
    const curUser = await User.findOne({ externalId });
    if (curUser) {
        if (curUser.isArchived) {
            return next(new AppError('This account has been deactivated', 403));
        }
        req.userId = curUser._id;
        return next();
    }
    const newUser = await createUser(externalId);
    req.userId = newUser._id;
    return next();
});

const createUser = async (externalId) => {
    //build user object from Auth0
    const userObject = await auth0.buildUserFromAuth0(externalId);

    const newUser = await User.create(userObject);

    if (!newUser) {
        throw new AppError(`couldn't create user`, 404);
    }

    return newUser;
};

exports.getMe = catchAsync(async (req, res, next) => {
    const userId = req.userId;

    const user = await User.findOne({ _id: userId, isArchived: { $ne: true } });
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});