const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const auth0 = require('../middleware/auth0');

exports.getCurrentUser = catchAsync(async (req, res, next) => {
    const externalId = req.auth.payload.sub;
    //find user id and attach to request
    const curUser = await User.findOne({ externalId: externalId });
    if (!curUser) {
        const newUser = await createUser(externalId);
        req.userId = newUser._id;
        req.userPreferences = newUser.preferences || { aiSuggestions: false };
        return next();
    }
    req.userId = curUser._id;
    req.userPreferences = curUser.preferences || { aiSuggestions: false };
    next();
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

exports.getUserPreferences = catchAsync(async (req, res, next) => {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            preferences: user.preferences || { aiSuggestions: false }
        }
    });
});

exports.updateUserPreferences = catchAsync(async (req, res, next) => {
    const userId = req.userId;
    const { preferences } = req.body;

    if (!preferences || typeof preferences !== 'object') {
        return next(new AppError('Invalid preferences data', 400));
    }

    // Fetch current user to merge preferences
    const currentUser = await User.findById(userId);
    if (!currentUser) {
        return next(new AppError('User not found', 404));
    }

    // Merge existing preferences with new ones
    const updatedPreferences = {
        ...(currentUser.preferences || {}),
        ...preferences
    };

    const user = await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                preferences: updatedPreferences
            }
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            preferences: user.preferences
        }
    });
});