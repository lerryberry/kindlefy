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
    const userObject = await auth0.buildUserFromAuth0(externalId);

    // Relink by email if a user already exists with this email but a different
    // externalId (e.g. Auth0 sub rotated, tenant reset, or connection merge).
    const existingByEmail = await User.findOne({ email: userObject.email });
    if (existingByEmail) {
        if (existingByEmail.isArchived) {
            throw new AppError('This account has been deactivated', 403);
        }
        if (existingByEmail.externalId !== externalId) {
            existingByEmail.externalId = externalId;
        }
        if (userObject.name && existingByEmail.name !== userObject.name) {
            existingByEmail.name = userObject.name;
        }
        await existingByEmail.save();
        return existingByEmail;
    }

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