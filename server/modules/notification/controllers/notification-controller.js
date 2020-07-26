require('../models/notification-model');
const OneSignal = require('../../../bin/handlers/onesignal');

const repository = require('../repositories/notification-repository');
const repositoryUser = require('../../user/repositories/user-repository');

const _repo = new repository();
const _repoUser = new repositoryUser();

const ctrlBase = require('../../../bin/base/controller-base');
const validation = require('../../../bin/helpers/validation');

function notificationController() {}
notificationController.prototype.post = async (req, res) => {
  const _validationContract = new validation();
  _validationContract.isRequired(
    req.body.content,
    'O conteúdo da notification é obrigatório',
  );
  _validationContract.isRequired(
    req.body.userFor,
    'O userFor notification é obrigatório',
  );
  if (!_validationContract.isValid()) {
    res
      .status(400)
      .send({
        message: 'Existem dados inválidos na sua requisição',
        validation: _validationContract.errors(),
      })
      .end();
    return;
  }
  try {
    const pushIdUserFor = await _repoUser.getPushId(req.body.userFor);
    if (pushIdUserFor === null) {
      res
        .status(400)
        .send({
          message: 'Existem dados inválidos na sua requisição',
        })
        .end();
      return;
    }
    await OneSignal.sendNotification(
      pushIdUserFor.pushId,
      req.usuarioLogado.user.nome,
      req.body.content,
    );
    ctrlBase.post(_repo, _validationContract, req, res);
  } catch (erro) {
    res.status(500).send({ message: 'Erro no processamento', error: erro });
  }
};
notificationController.prototype.getMy = async (req, res) => {
  const _validationContract = new validation();
  _validationContract.isRequired(req.params.page, 'pageNumber obrigatório');
  ctrlBase.getMy(_repo, _validationContract, req, res);
};
notificationController.prototype.put = async (req, res) => {
  const _validationContract = new validation();
  _validationContract.isRequired(req.params.id, 'id obrigatório');
  ctrlBase.put(_repo, _validationContract, req, res);
};
notificationController.prototype.get = async (req, res) => {
  ctrlBase.get(_repo, req, res);
};
notificationController.prototype.getById = async (req, res) => {
  ctrlBase.getById(_repo, req, res);
};
notificationController.prototype.delete = async (req, res) => {
  ctrlBase.delete(_repo, req, res);
};

module.exports = notificationController;
