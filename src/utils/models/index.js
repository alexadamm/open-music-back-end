const { nanoid } = require('nanoid');

class SongModel {
  constructor(entry) {
    this.id = `song-${nanoid(16)}`;
    this.title = entry.title;
    this.year = entry.year;
    this.performer = entry.performer;
    this.genre = entry.genre;
    this.duration = entry.duration;

    const currentTime = new Date().toISOString();
    this.insertedAt = currentTime;
    this.updatedAt = currentTime;
  }

  static updateModel(id, payload) {
    const updatedModel = new SongModel(payload);
    updatedModel.id = id;
    return updatedModel;
  }

  songArray(isUpdated = false) {
    const anArray = [
      this.id,
      this.title,
      this.year,
      this.performer,
      this.genre,
      this.duration,
      this.insertedAt,
      this.updatedAt,
    ];

    if (isUpdated) {
      anArray.splice(6, 1);
    }

    return anArray;
  }

  static mapDBToModel(db) {
    const model = {
      ...db,
      insertedAt: db.inserted_at,
      updatedAt: db.updated_at,
    };
    delete model.inserted_at;
    delete model.updated_at;
    return model;
  }
}

module.exports = SongModel;
