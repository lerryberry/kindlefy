const secrets = require('./ecosystem.secrets.js');

module.exports = {
    apps: [
        {
            name: "krystallise-backend-dev",
            script: "./backend/server.js",
            watch: true,
            env: {
                NODE_ENV: "development",
                PORT: 3000,
                AUTH0_AUDIENCE: "auth0-m2m-endpoint",
                AUTH0_DOMAIN: "https://auth.krystallise.com",
                CORS_ORIGIN: "http://localhost:3000",
                ...secrets.backendDev
            }
        },
        {
            name: "krystallise-backend-prod",
            script: "./backend/server.js",
            watch: false,
            env: {
                NODE_ENV: "production",
                PORT: 3000,
                CORS_ORIGIN: "https://app.krystallise.com",
                AUTH0_AUDIENCE: "auth0-m2m-endpoint",
                AUTH0_DOMAIN: "https://auth.krystallise.com",
                ...secrets.backendProd
            }
        }
    ]
}; 