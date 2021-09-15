const autoBind = require('auto-bind');
const errorHandler = require('../errorHandler');

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    autoBind(this);
  }

  async postSongHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);
      const songId = await this._service.addSong(request.payload);
      const response = h.response({
        status: 'success',
        message: 'Lagu berhasil ditambahkan',
        data: {
          songId,
        },
      });
      response.code(201);
      return response;
    } catch (e) {
      return errorHandler(e, h);
    }
  }

  async getSongsHandler(request, h) {
    const songs = await this._service.getSongs();
    const response = h.response({
      status: 'success',
      data: {
        songs,
      },
    });
    response.code(200);
    return response;
  }

  async getSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const song = await this._service.getSongById(id);

      const response = h.response({
        status: 'success',
        data: {
          song,
        },
      });
      response.code(200);
      return response;
    } catch (e) {
      return errorHandler(e, h);
    }
  }

  async putSongByIdHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);
      const { id } = request.params;

      await this._service.editSongById(id, request.payload);

      const response = h.response({
        status: 'success',
        message: 'Lagu berhasil diperbarui',
      });
      response.code(200);
      return response;
    } catch (e) {
      return errorHandler(e, h);
    }
  }

  async deleteSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
      await this._service.deleteSongById(id);

      const response = h.response({
        status: 'success',
        message: 'Catatan berhasil dihapus',
      });
      response.code(200);
      return response;
    } catch (e) {
      return errorHandler(e, h);
    }
  }
}

module.exports = SongsHandler;
