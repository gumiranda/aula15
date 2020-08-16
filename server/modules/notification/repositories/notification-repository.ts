import '../models/notification-model';
import base from '../../../bin/base/repository-base';
import { AddNotificationModel } from '../models/AddNotificationModel';
import { NotificationModel } from '../models/NotificationModel';
import { ModelBase } from '../../../bin/base/ModelBase';
export default class notificationRepository {
  public _base: base;
  constructor() {
    this._base = new base('Notification');
  }

  create(modelData: AddNotificationModel): Promise<ModelBase> {
    return this._base.create(modelData, 'notifications');
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
