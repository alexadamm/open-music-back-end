const autoBind = require('auto-bind');
const errorHandler = require('../errorHandler');

class ExportsHandler {
  constructor(producerService, playlistsService, validator) {
    this._producerService = producerService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    autoBind(this);
  }

  async postExportPlaylistHandler(request, h) {
    try {
      this._validator.validateExportPlaylistPayload(request.payload);
      const { targetEmail } = request.payload;

      const { playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistsService.verifyPlaylistExistance(playlistId);
      await this._playlistsService.verifyPlaylistAccess({ playlistId, credentialId });

      const message = {
        userId: credentialId,
        playlistId,
        targetEmail,
      };
      await this._producerService.sendMessage('export:playlist', JSON.stringify(message));

      const response = h.response({
        status: 'success',
        message: 'Permintaan Anda sedang kami proses',
      });
      response.code(201);
      return response;
    } catch (e) {
      return errorHandler(e, h);
    }
  }
}

module.exports = ExportsHandler;
