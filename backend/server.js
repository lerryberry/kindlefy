const mongoose = require('mongoose');

const app = require('./app');
const DB = process.env.DATABASE;

mongoose.connect(DB).then(() => { });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {

});

function handleCrash(err, eventName) {
    console.error(eventName, err.name, err.message);
    console.error("App crashed, killing session");

    if (server) {
        server.close(() => {
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
}

process.on('uncaughtException', (err) => handleCrash(err, 'Uncaught Exception:'));
process.on('unhandledRejection', (err) => handleCrash(err, 'Unhandled Rejection:'));

// Handle SIGTERM signal (e.g., from Docker stop command)
process.on('SIGTERM', () => {

    if (server) {
        server.close(() => {

            // Mongoose 8+ returns a promise for close(); it no longer accepts callbacks.
            mongoose.connection.close()
                .then(() => process.exit(0))
                .catch(err => {
                    console.error('Error closing mongoose connection on SIGTERM', err);
                    process.exit(1);
                });
        });
    } else {
        process.exit(0);
    }
});




