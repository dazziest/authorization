import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import routes from './routes';

import models, { sequelize } from './models';
import createUsersWithMessages from './utils/dataseed';

const eraseDatabaseOnSync = true;

const port = process.env.PORT;
const app = express();

app.use(cors());
//aParses the text as JSON and exposes the resulting object on req.body
app.use(express.json());
//Parses the text as URL encoded data (which is how browsers tend to send form data from regular forms set to POST) and exposes the resulting object (containing the keys and values) on req.body
app.use(express.urlencoded({ extended: true }));

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

sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
    if (eraseDatabaseOnSync) {
        createUsersWithMessages(models);
    }

    app.listen(port, () =>
      console.log(`Example app listening on port ${port}!`),
    );
});

