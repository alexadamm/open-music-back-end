const autoBind = require('auto-bind');
const errorHandler = require('../errorHandler');

class PlaylistsHandler {
  constructor(playlistsService, validator) {
    this._playlistsService = playlistsService;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    try {
      this._validator.validatePostPlaylistPayload(request.payload);
      const { name } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      const playlistId = await this._playlistsService.addPlaylist(name, credentialId);

      const response = h.response({
        status: 'success',
        message: 'Playlist berhasil ditambahkan',
        data: {
          playlistId,
        },
      });
      response.code(201);
      return response;
    } catch (e) {
      return errorHandler(e, h);
    }
  }

  async getPlaylistsHandler(request, h) {
    try {
      const { id: credentialId } = request.auth.credentials;
      const playlists = await this._playlistsService.getPlaylists(credentialId);

      return {
        status: 'success',
        data: {
          playlists,
        },
      };
    } catch (e) {
      return errorHandler(e, h);
    }
  }

  async deletePlaylistByPlaylistIdHandler(request, h) {
    try {
      const { playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
      await this._playlistsService.deletePlaylistByPlaylistId(playlistId);

      return {
        status: 'success',
        message: 'Playlist berhasil dihapus',
      };
    } catch (e) {
      return errorHandler(e, h);
    }
  }
}

module.exports = PlaylistsHandler;
