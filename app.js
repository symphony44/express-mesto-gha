const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { celebrate, Joi, errors } = require('celebrate');
const cookieParser = require('cookie-parser');
const { ERR_SERVER_ERROR } = require('./errors/errors');
const NotFoundError = require('./errors/NotFoundError');
const { createUser, login } = require('./controllers/users');

const app = express();

const { PORT = 3000 } = process.env;

const userRouter = require('./routes/users');
const cardRouter = require('./routes/cards');
const auth = require('./middlewares/auth');

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/users', userRouter);
app.use('/cards', cardRouter);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
}), login);
app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30)
      .default('Жак-Ив Кусто'),
    about: Joi.string().min(2).max(30)
      .default('Исследователь'),
    avatar: Joi.string()
      .default('https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png'),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), createUser);

app.use(auth);

app.use(errors);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || ERR_SERVER_ERROR;
  const message = statusCode === ERR_SERVER_ERROR ? 'На сервере произошла ошибка.' : err.message;
  res.status(statusCode).send({ message });
  next();
});

// eslint-disable-next-line no-console
app.listen(PORT, () => { console.log(`Listening to port: ${PORT}`); });
