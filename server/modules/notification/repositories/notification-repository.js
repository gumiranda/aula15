require('../models/notification-model');
const base = require('../../../bin/base/repository-base');

class notificationRepository {
  constructor() {
    this._base = new base('Notification');
  }

  create(data) {
    return this._base.create(data);
  }

  update(id, data) {
    return this._base.update(id, data);
  }

  getAll() {
    return this._base.getAll();
  }

  getById(id) {
    return this._base.getById(id);
  }

  delete(id) {
    return this._base.delete(id);
  }

  async getMy(page, user) {
    const notifications = await this._base._model
      .find({ ativo: { $ne: false }, userFor: user._id })
      .skip((page - 1) * 10)
      .limit(10)
      .sort({ dataCriacao: -1 });
    const notificationsCount = await this._base._model
      .find({ ativo: { $ne: false }, userFor: user._id })
      .count();
    return {
      notifications,
      notificationsCount,
    };
  }
}

module.exports = notificationRepository;
