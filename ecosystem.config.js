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
                NODE_ENV: "development",
                CORS_ORIGIN: "http://localhost:5173"
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