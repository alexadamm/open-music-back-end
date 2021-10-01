const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class PlaylistSongsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addSongToPlaylist({ songId, playlistId }) {
    const id = `playlist_song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal ditambahkan kedalam playlist');
    }

    this._cacheService.delete(`playlistSongs:${playlistId}`);
  }

  async getSongsFromPlaylistByPlaylistId(playlistId) {
    const cacheResult = await this._cacheService.get(`playlistSongs:${playlistId}`);
    if (cacheResult) {
      return cacheResult;
    }
    const query = {
      text: `SELECT songs.id, songs.title, songs.performer
          FROM playlistsongs
          INNER JOIN playlists
          ON playlists.id = playlistsongs.playlist_id
          INNER JOIN songs
          ON songs.id = playlistsongs.song_id
          WHERE playlistsongs.playlist_id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows) {
      throw new InvariantError('Gagal mendapatkan lagu-lagu dari playlist');
    }

    await this._cacheService.set(`playlistSongs:${playlistId}`, JSON.stringify(result.rows));
    return result.rows;
  }

  async deleteSongFromPlaylist({ playlistId, songId }) {
    const query = {
      text: 'DELETE FROM playlistsongs WHERE playlist_id=$1 AND song_id=$2 returning id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal dihapus dari playlist');
    }

    this._cacheService.delete(`playlistSongs:${playlistId}`);
  }
}

module.exports = PlaylistSongsService;
