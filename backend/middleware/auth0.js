const catchAsync = require('../utils/catchAsync.js')
const axios = require('axios');

const getManagementToken = async () => {
    const domain = process.env.AUTH0_MGMT_DOMAIN || process.env.AUTH0_DOMAIN;
    const audience = process.env.AUTH0_MGMT_AUDIENCE || `https://${domain}/api/v2/`;

    if (!domain) {
        throw new Error('AUTH0_DOMAIN (or AUTH0_MGMT_DOMAIN) is required');
    }

    const response = await axios.post(`https://${domain}/oauth/token`, {
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        audience,
        grant_type: 'client_credentials',
        scope: 'read:users'
    });
    return response.data.access_token;
};

const buildUserFromAuth0 = async (externalId) => {
    const token = await getManagementToken();
    const domain = process.env.AUTH0_MGMT_DOMAIN || process.env.AUTH0_DOMAIN;
    if (!domain) {
        throw new Error('AUTH0_DOMAIN (or AUTH0_MGMT_DOMAIN) is required');
    }
    const response = await axios.get(
        `https://${domain}/api/v2/users/${externalId}`,
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