const Card = require('../models/card');
const {
  throwErrors,
  ERR_NOT_FOUND,
} = require('../errors/errors');

const message = 'Карточка с указанным id не найдена.';

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => {
      res.send(cards);
    })
    .catch((err) => {
      throwErrors(err, res, message);
    });
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => {
      res.send(card);
    })
    .catch((err) => {
      throwErrors(err, res, message);
    });
};

module.exports.deleteCard = (req, res) => {
  const { cardId } = req.params;
  Card.findByIdAndRemove(cardId)
    .then((card) => {
      if (!card) {
        return res.status(ERR_NOT_FOUND).send({ message: `Ошибка, статус: ${ERR_NOT_FOUND}. ${message}. ` });
      }
      res.send({ message: 'Пост удалён.' });
    })
    .catch((err) => {
      throwErrors(err, res, message);
    });
};

module.exports.likeCard = (req, res) => {
  const { cardId } = req.params;
  Card.findByIdAndUpdate(
    cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        return res.status(ERR_NOT_FOUND).send({ message: `Ошибка, статус: ${ERR_NOT_FOUND}. ${message}. ` });
      }
      res.send(card);
    })
    .catch((err) => {
      throwErrors(err, res, message);
    });
};

module.exports.dislikeCard = (req, res) => {
  const { cardId } = req.params;
  Card.findByIdAndUpdate(
    cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        return res.status(ERR_NOT_FOUND).send({ message: `Ошибка, статус: ${ERR_NOT_FOUND}. ${message}. ` });
      }
      res.send(card);
    })
    .catch((err) => {
      throwErrors(err, res, message);
    });
};
