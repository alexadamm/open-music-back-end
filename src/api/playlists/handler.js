const autoBind = require('auto-bind');
const errorHandler = require('../errorHandler');

class PlaylistsHandler {
  constructor(playlistsService, playlistSongsService, songsService, validator) {
    this._playlistsService = playlistsService;
    this._playlistSongsService = playlistSongsService;
    this._songsService = songsService;
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

  async getPlaylistsByCredentialIdHandler(request, h) {
    try {
      const { id: credentialId } = request.auth.credentials;

      const playlists = await this._playlistsService.getPlaylistsByCredentialId(credentialId);
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

      await this._playlistsService.verifyPlaylistExistance(playlistId);
      await this._playlistsService.verifyPlaylistOwner({ playlistId, credentialId });
      await this._playlistsService.deletePlaylistByPlaylistId(playlistId);

      return {
        status: 'success',
        message: 'Playlist berhasil di hapus',
      };
    } catch (e) {
      return errorHandler(e, h);
    }
  }

  async postSongToPlaylistHandler(request, h) {
    try {
      this._validator.validateSongToPlaylistPayload(request.payload);

      const { songId } = request.payload;
      const { playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._songsService.verifySongExistance(songId);
      await this._playlistsService.verifyPlaylistExistance(playlistId);
      await this._playlistsService.verifyPlaylistOwner({ playlistId, credentialId });

      await this._playlistSongsService.addSongToPlaylist({ songId, playlistId });

      const response = h.response({
        status: 'success',
        message: 'Lagu berhasil ditambahkan kedalam playlist',
      });
      response.code(201);
      return response;
    } catch (e) {
      return errorHandler(e, h);
    }
  }

  async getSongsFromPlaylistByPlaylistIdHandler(request, h) {
    try {
      const { playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistsService.verifyPlaylistExistance(playlistId);
      await this._playlistsService.verifyPlaylistOwner({ playlistId, credentialId });

      const songs = await this._playlistSongsService.getSongsFromPlaylistByPlaylistId(playlistId);

      return {
        status: 'success',
        data: {
          songs,
        },
      };
    } catch (e) {
      return errorHandler(e, h);
    }
  }

  async deleteSongFromPlaylistHandler(request, h) {
    try {
      this._validator.validateSongToPlaylistPayload(request.payload);

      const { songId } = request.payload;
      const { playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._songsService.verifySongExistance(songId);
      await this._playlistsService.verifyPlaylistExistance(playlistId);
      await this._playlistsService.verifyPlaylistOwner({ playlistId, credentialId });

      await this._playlistSongsService.deleteSongFromPlaylist({ songId, playlistId });

      return {
        status: 'success',
        message: 'Lagu berhasil dihapus dari playlist',
      };
    } catch (e) {
      return errorHandler(e, h);
    }
  }
}

module.exports = PlaylistsHandler;
