const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class PlaylistSongsService {
  constructor() {
    this._pool = new Pool();
  }

  async getSongsFromPlaylistByPlaylistId(playlistId) {
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

    if (!result.rows.length) {
      throw new InvariantError('Gagal mendapatkan lagu-lagu dari playlist');
    }

    return result.rows;
  }
}

module.exports = PlaylistSongsService;
