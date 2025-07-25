module.exports = {
    apps: [
        {
            name: "krystallise-backend-dev",
            script: "./backend/server.js",
            watch: true,
            env: {
                NODE_ENV: "development",
                PORT: 3000,
                DATABASE: "mongodb+srv://app:JvZjC9F73hw3qOzA@cluster0.181u0.mongodb.net/boardroom",
                AUTH0_CLIENT_ID: "wjNGsh4CcmU4iVPftRbnBTyoqaF9BLGq",
                AUTH0_CLIENT_SECRET: "QO9WmV8UJ2Dt_p8DEoQ175MR6dDx6XBwh0HsGmPZVMNf1zamPc8rjFbX3hCT8nEr"
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
                DATABASE: "mongodb+srv://app:JvZjC9F73hw3qOzA@cluster0.181u0.mongodb.net/boardroom",
                AUTH0_CLIENT_ID: "wjNGsh4CcmU4iVPftRbnBTyoqaF9BLGq",
                AUTH0_CLIENT_SECRET: "QO9WmV8UJ2Dt_p8DEoQ175MR6dDx6XBwh0HsGmPZVMNf1zamPc8rjFbX3hCT8nEr"
            }
        }
    ]
}; 