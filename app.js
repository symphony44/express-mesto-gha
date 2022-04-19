require('dotenv').config();
const jwt = require('jsonwebtoken');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { celebrate, Joi, errors } = require('celebrate');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const { createUser, login } = require('./controllers/users');
const NotFoundError = require('./errors/NotFoundError');
const middlewareError = require('./middlewares/error');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { NODE_ENV, JWT_SECRET } = process.env;

const app = express();
app.use(helmet());

const { PORT = 3000 } = process.env;

const userRouter = require('./routes/users');
const cardRouter = require('./routes/cards');
const auth = require('./middlewares/auth');

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://symphony44.nomoredomains.work',
    'https://symphony44.nomoredomains.work',
  ],
  methods: [
    'GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'HEAD',
  ],
  allowedHeaders: [
    'Content-Type', 'Authorization', 'Origin', 'Accept',
  ],
  credentials: true,
}));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(requestLogger);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

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
    avatar: Joi.string().pattern(/(https|http):\/\/(www.)?[a-zA-Z0-9-_]+\.[a-zA-Z]+(\/[a-zA-Z0-9-._/~:@!$&'()*+,;=]*$)?/)
      .default('https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png'),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), createUser);
app.get('/signout', (req, res) => {
  res.status(200)
    .clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
    })
    .send({ message: 'Выход' });
});
app.get('/auth-check', (req, res) => {
  const token = req.cookies.jwt;
  if (!token) {
    res.send({ isLogin: false });
  } else {
    let payload;

    try {
      payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key');
    } catch (err) {
      res.send({ isLogin: false });
    }
    if (payload) {
      res.send({ isLogin: true });
    }
  }
});

app.use(auth);

app.use('/users', userRouter);
app.use('/cards', cardRouter);

app.use((req, res, next) => {
  next(new NotFoundError('Маршрут не найден'));
});

app.use(errorLogger);
app.use(errors());
app.use(middlewareError);

// eslint-disable-next-line no-console
app.listen(PORT, () => { console.log(`Listening to port: ${PORT}`); });
