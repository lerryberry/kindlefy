const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const auth0 = require('../middleware/auth0');

exports.getCurrentUser = catchAsync(async (req, res, next) => {
    const externalId = req.auth.payload.sub;
    //find user id and attach to request
    const curUser = await User.findOne({ externalId: externalId });
    if (!curUser) {
        const newUser = await createUser(externalId);
        req.userId = newUser._id;
        return next();
    }
    req.userId = curUser._id;
    next();
});

const createUser = async (externalId) => {
    //build user object from Auth0
    const userObject = await auth0.buildUserFromAuth0(externalId);

    const newUser = await User.create(userObject);

    if (!newUser) {
        return next(new AppError(`couldn't create user`, 404))
    }

    return newUser;
}