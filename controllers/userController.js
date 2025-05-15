//const { query } = require('express');
const User = require('../models/userModel');
const catchAsync = require('./../utils/catchAsync');

exports.getCurrentUser = catchAsync(async (req, res, next) => {
    //find user id and attach to request
    const curUser = await User.findOne({ externalId: req.oidc.user.sub });
    if (!curUser) {
        const newUser = await createUser({
            externalId: req.oidc.user.sub,
            displayName: req.oidc.user.nickname,
            email: req.oidc.user.email,
            profilePic: req.oidc.user.picture
        });
        req.userId = newUser._id;
        return next();
    }
    req.userId = curUser._id;
    next();
});

const createUser = async (userObj) => {
    const newUser = await User.create(userObj);

    if(!newUser){
        return next(new AppError(`couldn't create user`, 404))
    }

    return newUser;
}