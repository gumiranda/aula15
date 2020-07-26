require('../models/user-model');
const bcrypt = require('bcryptjs');
const base = require('../../../bin/base/repository-base');

class userRepository {
  constructor() {
    this._base = new base('User');
    this._projection = 'nome email payDay type cpf phone pushId';
  }

  async authenticate(Email, Senha, flag) {
    const user = await this._base._model.findOne({ email: Email });
    const userR = await this._base._model.findOne(
      { email: Email },
      this._projection,
    );
    if (await bcrypt.compareSync(Senha, user.senha)) {
      return userR;
    }
    return null;
  }

  IsEmailExiste(Email) {
    return this._base._model.findOne({ email: Email }, this._projection);
  }

  async create(data, req) {
    const userCriado = await this._base.create(data);
    const userR = await this._base._model.findOne(
      { _id: userCriado._id },
      this._projection,
    );
    return userR;
  }

  updatePayment(data, userid) {
    return this._base.update(userid, { payDay: data });
  }

  async completeRegister(data, userid) {
    await this._base.update(userid, data);
    const userR = await this._base._model.findOne(
      { _id: userid },
      this._projection,
    );
    return userR;
  }

  async update(id, data, usuarioLogado) {
    if (usuarioLogado._id === id) {
      if (
        data.oldPassword !== data.senha &&
        data.oldPassword &&
        data.senha !== undefined &&
        data.senhaConfirmacao !== undefined &&
        data.senha === data.senhaConfirmacao
      ) {
        const user = await this._base._model.findOne({ _id: id });
        if (await bcrypt.compareSync(data.oldPassword, user.senha)) {
          const salt = await bcrypt.genSaltSync(10);
          const _hashSenha = await bcrypt.hashSync(data.senha, salt);
          let { nome } = user;
          let { email } = user;
          if (data.email) {
            email = data.email;
          }
          if (data.nome) {
            nome = data.nome;
          }
          const usuarioAtualizado = await this._base.update(id, {
            nome,
            email,
            senha: _hashSenha,
          });
          return this._base._model.findById(
            usuarioAtualizado._id,
            this._projection,
          );
        }
        return { message: 'Senha inválida' };
      }
    } else {
      return { message: 'Você não tem permissão para editar esse usuário' };
    }
  }

  getAll() {
    return this._base._model.find({}, this._projection);
  }

  getPushId(_id) {
    return this._base._model.findOne({ _id }, 'pushId nome');
  }

  async getByPage(page, user) {
    const users = await this._base._model
      .find({ type: 'client', _id: { $ne: user } }, this._projection)
      .skip((page - 1) * 10)
      .limit(10)
      .sort({ createdAt: -1 });
    const usersCount = await this._base._model
      .find({ type: 'client', _id: { $ne: user } }, this._projection)
      .count();
    return {
      users,
      usersCount,
    };
  }

  delete(id) {
    return this._base.delete(id);
  }
}

module.exports = userRepository;
