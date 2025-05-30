const catchAsync = require('../utils/catchAsync.js')
const axios = require('axios');

const getManagementToken = async () => {
    const response = await axios.post('https://dev-d85syd7wejqy2nrm.us.auth0.com/oauth/token', {
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        audience: 'https://dev-d85syd7wejqy2nrm.us.auth0.com/api/v2/',
        grant_type: 'client_credentials'
    });
    return response.data.access_token;
};

const buildUserFromAuth0 = async (externalId) => {
    const token = await getManagementToken();
    const response = await axios.get(
        `https://dev-d85syd7wejqy2nrm.us.auth0.com/api/v2/users/${externalId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return {
        externalId: externalId,
        email: response.data.email,
        name: response.data.name || response.data.nickname || response.data.email.split('@')[0]
    };
};

module.exports = {
    getManagementToken,
    buildUserFromAuth0
};