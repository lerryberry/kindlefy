const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => handleCrash(err, 'Uncaught Exception:'));
process.on('unhandledRejection', (err) => handleCrash(err, 'Unhandled Rejection:'));

dotenv.config({path: './config.env'});
const app = require('./app');

const DB = process.env.DATABASE;

mongoose.connect(DB).then(con => console.log(`connected to db!`));

const server = app.listen(process.env.PORT, () => {
    console.log(`server running on port ${process.env.PORT} with "${process.env.NODE_ENV}" environment`);
});

function handleCrash(err, eventName) {
    console.error(eventName, err.name, err.message);
    console.error("App crashed, killing session");
  
    if (server) {
      server.close(() => {
        process.exit(1);
        // TODO: Add tool to restart app here
      });
    } else {
      process.exit(1);
    }
}
  

  

  