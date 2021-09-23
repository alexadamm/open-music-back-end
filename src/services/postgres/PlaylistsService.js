const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist(name, credentialId) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, credentialId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getPlaylistsByCredentialId(credentialId) {
    const query = {
      text: `
          SELECT playlists.id, playlists.name, users.username
          FROM playlists
          INNER JOIN users
          ON users.id = playlists.owner
          LEFT JOIN collaborations
          ON collaborations.playlist_id = playlists.id
          WHERE playlists.owner = $1
          OR collaborations.user_id = $1
          `,
      values: [credentialId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async deletePlaylistByPlaylistId(playlistId) {
    const query = {
      text: 'DELETE FROM playlists where id = $1',
      values: [playlistId],
    };

    await this._pool.query(query);
  }

  async verifyPlaylistOwner({ playlistId, credentialId }) {
    const query = {
      text: 'SELECT owner FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (result.rows[0].owner !== credentialId) {
      throw new AuthorizationError('Gagal melakukan operasi. Anda bukan pemilik playlist ini');
    }
  }

  async verifyPlaylistAccess({ playlistId, credentialId }) {
    const query = {
      text: `SELECT playlists.id
      FROM playlists
      INNER JOIN users
      ON users.id = playlists.owner
      LEFT JOIN collaborations
      ON collaborations.playlist_id = playlists.id
      WHERE (playlists.owner = $1 OR collaborations.user_id = $1)
      AND playlists.id = $2`,
      values: [credentialId, playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0]) {
      throw new AuthorizationError('Gagal melakukan operasi. Anda bukan pemilik/kolaborator dari playlist ini.');
    }
  }

  async verifyPlaylistExistance(playlistId) {
    const query = {
      text: 'SELECT COUNT(1) FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result) {
      throw new NotFoundError('Gagal melakukan operasi. Playlist tidak ditemukan');
    }
  }
}

module.exports = PlaylistsService;
