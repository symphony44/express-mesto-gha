const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

const userRouter = require('./routes/users');
const cardRouter = require('./routes/cards');

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

app.use((req, res, next) => {
  req.user = {
    _id: '62447609b8d54fa523bd6d75',
  };

  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/users', userRouter);
app.use('/cards', cardRouter);

// eslint-disable-next-line no-console
app.listen(PORT, () => { console.log(`Listening to port: ${PORT}`); });

app.use((req, res, next) => {
  res.status(404).send({ message: 'По данному адресу ничего нет' });

  next();
});
