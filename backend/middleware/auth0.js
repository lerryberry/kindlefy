const axios = require('axios');

/** Hostname only, e.g. tenant.us.auth0.com (AUTH0_DOMAIN may include https://) */
const auth0MgmtHost = () => {
    const raw = process.env.AUTH0_MGMT_DOMAIN || process.env.AUTH0_DOMAIN;
    if (!raw) return null;
    return String(raw).replace(/^https?:\/\//i, '').replace(/\/$/, '');
};

const getManagementToken = async () => {
    const host = auth0MgmtHost();
    const audience = process.env.AUTH0_MGMT_AUDIENCE || `https://${host}/api/v2/`;

    if (!host) {
        throw new Error('AUTH0_DOMAIN (or AUTH0_MGMT_DOMAIN) is required');
    }

    const response = await axios.post(`https://${host}/oauth/token`, {
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
    const host = auth0MgmtHost();
    if (!host) {
        throw new Error('AUTH0_DOMAIN (or AUTH0_MGMT_DOMAIN) is required');
    }
    const response = await axios.get(
        `https://${host}/api/v2/users/${externalId}`,
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