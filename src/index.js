import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import ConnectSession from 'connect-session-sequelize';

import routes from './routes';

import models, { sequelize } from './models';
import createUsersWithMessages from './utils/dataseed';

let SequelizeStore = ConnectSession(session.Store);

const eraseDatabaseOnSync = true;

const port = process.env.PORT;
const app = express();

app.use(cors());
//aParses the text as JSON and exposes the resulting object on req.body
app.use(express.json());
//Parses the text as URL encoded data (which is how browsers tend to send form data from regular forms set to POST) and exposes the resulting object (containing the keys and values) on req.body
app.use(express.urlencoded({ extended: true }));

app.use(helmet());

let sessionStore = new SequelizeStore({
  db: sequelize,
  checkExpirationInterval: 15 * 60 * 1000, // The interval at which to cleanup expired sessions in milliseconds.
  expiration: 24 * 60 * 60 * 1000  // The maximum age (in milliseconds) of a valid session.
});

app.use(session({
  secret: process.env.SESSION,
  store: sessionStore
}));

app.use(async (req, res, next) => {
  req.context = {
    models,
  };
  next();
});

app.get('/', (req, res) => {
  return res.status(200).send({'message': 'Wew! Congratulations! Your first endpoint is working'});
});

app.use('/session', routes.session);

app.use('/users', routes.user);

app.use('/messages', routes.message);

app.use(async (req, res, next) => {
  req.context = {
    models,
    me: await models.User.findByLogin('rwieruch'),
  };
  next();
});

sessionStore.sync({ force: eraseDatabaseOnSync }).then(async () => {
    if (eraseDatabaseOnSync) {
        createUsersWithMessages(models);
    }

    app.listen(port, () =>
      console.log(`Example app listening on port ${port}!`),
    );
});

