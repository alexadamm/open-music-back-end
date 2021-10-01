const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const SongModel = require('../../utils/models');

class SongsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addSong(payload) {
    const newSong = new SongModel(payload);

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      values: newSong.songArray(),
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    this._cacheService.delete('songs:all');
    return result.rows[0].id;
  }

  async getSongs() {
    const cacheResult = await this._cacheService.get('songs:all');
    if (cacheResult) {
      return cacheResult;
    }

    const result = await this._pool.query('SELECT id, title, performer FROM songs');

    await this._cacheService.set('songs:all', JSON.stringify(result.rows));
    return result.rows;
  }

  async getSongById(id) {
    const cacheResult = await this._cacheService.get(`songs:${id}`);
    if (cacheResult) {
      return cacheResult;
    }
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu yang Anda cari tidak ditemukan');
    }

    await this._cacheService.set(`songs:${id}`, JSON.stringify(result.rows.map(SongModel.mapDBToModel)[0]));
    return result.rows.map(SongModel.mapDBToModel)[0];
  }

  async editSongById(id, payload) {
    const updatedSong = SongModel.updateModel(id, payload);
    const query = {
      text: 'UPDATE songs SET title = $2, year = $3, performer = $4, genre = $5, duration = $6, updated_at = $7 WHERE id = $1 RETURNING id',
      values: updatedSong.songArray(true),
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
    }

    this._cacheService.delete(`songs:${id}`);
    this._cacheService.delete('songs:all');
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }

    this._cacheService.delete(`songs:${id}`);
    this._cacheService.delete('songs:all');
  }

  async verifySongExistance(songId) {
    const query = {
      text: 'SELECT COUNT(1) FROM songs WHERE id = $1',
      values: [songId],
    };

    const result = await this._pool.query(query);

    if (!result) {
      throw new NotFoundError('Gagal melakukan operasi. Lagu tidak ditemukan');
    }
  }
}

module.exports = SongsService;
