const ERR_SERVER_ERROR = require('../errors/errors');

module.exports = ((err, req, res, next) => {
  const statusCode = err.statusCode || ERR_SERVER_ERROR;
  const message = statusCode === ERR_SERVER_ERROR ? 'На сервере произошла ошибка.' : err.message;
  res.status(statusCode).send({ message });
  next();
});
