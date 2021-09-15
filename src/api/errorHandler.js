const ClientError = require('../exceptions/ClientError');

const errorHandler = (error, h) => {
  if (error instanceof ClientError) {
    const response = h.response({
      status: 'fail',
      message: error.message,
    });
    response.code(error.statusCode);
    return response;
  }
  const response = h.response({
    status: 'error',
    message: 'Maaf, terjadi kesalahan pada server kami',
  });
  response.code(500);
  console.error(error);
  return response;
};

module.exports = errorHandler;
