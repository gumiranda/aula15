import mongoose from 'mongoose';
import { ModelBase } from './ModelBase';
import { MongoHelper } from '../helpers/db/mongo/mongo-helper';

export default class baseRepository {
  public _model: any;

  constructor(model) {
    this._model = mongoose.model(model);
  }
  async create(modelData: any, nameCollection: string) {
    const modelCollection = await MongoHelper.getCollection(nameCollection);
    const result = await modelCollection.insertOne(modelData);
    return result.ops[0];
  }
  async createBackup(data) {
    const modelo = new this._model(data);
    const resultado = await modelo.save();
    return resultado;
  }

  async update(id, data) {
    await this._model.findByIdAndUpdate(id, { $set: data });
    const resultado = await this._model.findById(id);
    return resultado;
  }

  async getAll() {
    return await this._model.find({});
  }

  async getMyAll(user) {
    return await this._model.find({ userId: user._id });
  }

  async delete(id) {
    return await this._model.findByIdAndDelete(id);
  }

  async getById(id) {
    return await this._model.findById(id);
  }
}
