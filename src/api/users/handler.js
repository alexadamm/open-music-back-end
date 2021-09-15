const autoBind = require('auto-bind');
const errorHandler = require('../errorHandler');

class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postUserHandler(request, h) {
    try {
      await this._validator.validateUserPayload(request.payload);
      const { username, password, fullname } = request.payload;
      const userId = await this._service.addUser({ username, password, fullname });

      const response = h.response({
        status: 'success',
        message: 'User berhasil ditambahkan',
        data: {
          userId,
        },
      });
      response.code(201);
      return response;
    } catch (e) {
      return errorHandler(e, h);
    }
  }
}

module.exports = UsersHandler;
