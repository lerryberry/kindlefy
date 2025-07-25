const mongoose = require('mongoose');

process.on('uncaughtException', (err) => handleCrash(err, 'Uncaught Exception:'));
process.on('unhandledRejection', (err) => handleCrash(err, 'Unhandled Rejection:'));

const app = require('./app');
const DB = process.env.DATABASE;

mongoose.connect(DB).then(con => console.log(`connected to db!`));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`server running on port ${process.env.PORT} with "${process.env.NODE_ENV}" environment`);
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

// Handle SIGTERM signal (e.g., from Docker stop command)
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    if (server) {
        server.close(() => {
            console.log('Server closed');
            mongoose.connection.close(() => {
                console.log('MongoDB connection closed');
                process.exit(0);
            });
        });
    } else {
        process.exit(0);
    }
});
  

  

  