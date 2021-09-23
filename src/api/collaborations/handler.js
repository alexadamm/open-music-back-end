const autoBind = require('auto-bind');
const errorHandler = require('../errorHandler');

class CollaborationsHandler {
  constructor(collaborationsService, playlistsService, usersService, validator) {
    this._collaborationsService = collaborationsService;
    this._usersService = usersService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    autoBind(this);
  }

  async postCollaborationHandler(request, h) {
    try {
      this._validator.validateCollaborationPayload(request.payload);

      const { playlistId, userId } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistsService.verifyPlaylistExistance(playlistId);
      await this._playlistsService.verifyPlaylistOwner({ playlistId, credentialId });
      await this._usersService.verifyUserExistance(userId);

      const collaborationId = await this._collaborationsService.addCollaboration({
        playlistId,
        userId,
      });

      const response = h.response({
        status: 'success',
        message: 'Kolaborasi berhasil ditambahkan',
        data: {
          collaborationId,
        },
      });
      response.code(201);
      return response;
    } catch (e) {
      return errorHandler(e, h);
    }
  }

  async deleteCollaborationHandler(request, h) {
    try {
      this._validator.validateCollaborationPayload(request.payload);

      const { playlistId, userId } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistsService.verifyPlaylistExistance(playlistId);
      await this._playlistsService.verifyPlaylistOwner({ playlistId, credentialId });
      await this._usersService.verifyUserExistance(userId);

      await this._collaborationsService.deleteCollaboration({ playlistId, userId });

      return {
        status: 'success',
        message: 'Kolaborasi berhasil dihapus',
      };
    } catch (e) {
      return errorHandler(e, h);
    }
  }
}

module.exports = CollaborationsHandler;
