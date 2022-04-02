const User = require('../models/user');
const {
  ERR_INCORRECT_DATA,
  ERR_NOT_FOUND,
  ERR_SERVER_ERROR,
  throwErrors,
} = require('../errors/errors');

const message = 'Пользователь с указанным id не найден';

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => {
      res.send(users);
    })
    .catch(() => {
      res.status(ERR_SERVER_ERROR)
        .send({ message: `Ошибка ${ERR_SERVER_ERROR}. Ошибка сервера.` });
    });
};

module.exports.getUsersById = (req, res) => {
  const { id } = req.params;
  User.findById(id)
    .then((user) => {
      if (!user) {
        return res.status(ERR_NOT_FOUND)
          .send({ message: `Ошибка, статус: ${ERR_NOT_FOUND}. ${message}.` });
      }
      res.send(user);
    })
    .catch((err) => {
      throwErrors(err, res, message);
    });
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => {
      res.send({ user });
    })
    .catch((err) => {
      throwErrors(err, res, message);
    });
};

module.exports.updateUserProfile = (req, res) => {
  const { name, about } = req.body;
  const id = req.user._id;
  if (!name || !about) {
    return res.status(ERR_INCORRECT_DATA).send({ message: `Ошибка, статус: ${ERR_INCORRECT_DATA}. Переданы некорректные данные.` });
  }
  User.findByIdAndUpdate(id, { name, about })
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      throwErrors(err, res, message);
    });
};


module.exports.updateUserAvatar = (req, res) => {
  const { avatar } = req.body;
  const id = req.user._id;
  if (!avatar) {
    return res.status(ERR_INCORRECT_DATA).send({ message: `Ошибка, статус: ${ERR_INCORRECT_DATA}. Переданы некорректные данные.` });
  }
  User.findByIdAndUpdate(id, { avatar })
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      throwErrors(err, res, message);
    });
};
