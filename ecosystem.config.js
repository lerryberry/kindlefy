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
                CORS_ORIGIN: "http://localhost:5173",
                AUTH0_AUDIENCE: "http://localhost:3000",
                AUTH0_DOMAIN: "https://dev-d85syd7wejqy2nrm.us.auth0.com",
                ...secrets.backendDev
            }
        },
        {
            name: "krystallise-frontend-dev",
            script: "npm",
            args: "run dev",
            cwd: "./frontend",
            watch: false,
            env: {
                NODE_ENV: "development"
            }
        },
        {
            name: "krystallise-backend-prod",
            script: "./backend/server.js",
            watch: false,
            env: {
                NODE_ENV: "production",
                PORT: 3000,
                CORS_ORIGIN: "https://krystallise-469a37509070.herokuapp.com/",
                ...secrets.backendProd
            }
        }
    ]
}; 