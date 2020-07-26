const OneSignal = require('../../../bin/handlers/onesignal');

const repository = require('../repositories/chat-repository');
const repositoryUser = require('../../user/repositories/user-repository');

const _repo = new repository();
const _repoUser = new repositoryUser();

const ctrlBase = require('../../../bin/base/controller-base');
const validation = require('../../../bin/helpers/validation');

function chatController() {}
chatController.prototype.post = async (req, res) => {
  const validationContract = new validation();
  validationContract.isRequired(req.body.userDest, 'a userDest é obrigatória');
  if (!validationContract.isValid()) {
    res
      .status(400)
      .send({
        message: 'Existem dados inválidos na sua requisição',
        validation: validationContract.errors(),
      })
      .end();
    return;
  }
  req.body.userRemet = req.usuarioLogado.user._id;

  const chat = await _repo.verifyChat(
    req.body.userDest,
    req.usuarioLogado.user._id,
  );
  if (chat === false) {
    ctrlBase.post(_repo, validationContract, req, res);
  } else {
    res.status(201).send(chat);
  }
};

chatController.prototype.deleteMessage = async (req, res) => {
  try {
    const { usuarioLogado, params } = req;
    const { user } = usuarioLogado;
    const { id, id2 } = params;
    const { _id } = user;
    const validationContract = new validation();

    validationContract.isRequired(
      id,
      'o id do chat que será atualizado obrigatório',
    );
    if (!validationContract.isValid()) {
      res
        .status(400)
        .send({
          message: 'Existem dados inválidos na sua requisição',
          validation: validationContract.errors(),
        })
        .end();
      return;
    }
    const resultado = await _repo.deleteMessage(id, id2, _id);
    if (resultado !== 'Operação inválida') {
      res.status(202).send({ message: 'Mensagem excluida com sucesso' });
    } else {
      res.status(401).send({ message: 'Não foi possível apagar mensagem' });
    }
  } catch (erro) {
    res.status(500).send({ message: 'Erro no processamento', error: erro });
  }
};
chatController.prototype.sendMessage = async (req, res) => {
  const { usuarioLogado, io, connectedUsers, body, params } = req;
  const { user } = usuarioLogado;
  const { id } = params;
  const { text } = body;
  const { _id, nome } = user;
  const validationContract = new validation();
  validationContract.isRequired(
    body.text,
    'o texto do comentário é obrigatório',
  );
  validationContract.isRequired(
    id,
    'o id do chat que será atualizado obrigatório',
  );
  if (!validationContract.isValid()) {
    res
      .status(400)
      .send({
        message: 'Existem dados inválidos na sua requisição',
        validation: validationContract.errors(),
      })
      .end();
    return;
  }
  try {
    const resultado = await _repo.sendMessage(id, text, _id);
    if (connectedUsers) {
      let userid;
      if (resultado.userDest.toString() === _id) {
        userid = resultado.userRemet;
      } else {
        userid = resultado.userDest;
      }
      const userSocket = connectedUsers[userid];
      if (userSocket) {
        const msg = {
          _id: new Date().getTime(),
          text,
          createdAt: new Date(),
          user: {
            _id,
            name: nome,
          },
        };
        io.to(userSocket).emit('response', msg);
      } else {
        const pushIdUserFor = await _repoUser.getPushId(userid);
        if (pushIdUserFor !== null) {
          await OneSignal.sendNotification(pushIdUserFor.pushId, nome, text);
        }
      }
    }

    res.status(202).send(resultado);
  } catch (erro) {
    if (erro instanceof OneSignal.HTTPError) {
      // When status code of HTTP response is not 2xx, HTTPError is thrown.
      console.log(erro.statusCode);
      console.log(erro.body);
      res
        .status(500)
        .send({ message: 'Erro no processamento', error: erro.body });
    } else {
      res
        .status(500)
        .send({ message: 'Erro no processamento', error: erro.toString() });
    }
  }
};

chatController.prototype.getMyChats = async (req, res) => {
  const { usuarioLogado, params } = req;
  const { user } = usuarioLogado;
  const { page } = params;
  const { _id } = user;
  const validationContract = new validation();
  validationContract.isRequired(page, 'pageNumber obrigatório');
  if (!validationContract.isValid()) {
    res
      .status(400)
      .send({
        message: 'Existem dados inválidos na sua requisição',
        validation: validationContract.errors(),
      })
      .end();
    return;
  }
  try {
    const resultado = await _repo.getMyChats(page, _id);
    res.status(200).send(resultado);
  } catch (erro) {
    res.status(500).send({ message: 'Erro no processamento', error: erro });
  }
};
chatController.prototype.delete = async (req, res) => {
  ctrlBase.delete(_repo, req, res);
};
chatController.prototype.getByIdPaginate = async (req, res) => {
  const validationContract = new validation();
  const { page, id } = req.params;
  validationContract.isRequired(page, 'pageNumber obrigatório');
  validationContract.isRequired(id, 'id do chat obrigatório');
  if (!validationContract.isValid()) {
    res
      .status(400)
      .send({
        message: 'Existem dados inválidos na sua requisição',
        validation: validationContract.errors(),
      })
      .end();
    return;
  }
  try {
    const resultado = await _repo.getByIdPaginate(id, page);
    res.status(200).send(resultado);
  } catch (erro) {
    res.status(500).send({ message: 'Erro no processamento', error: erro });
  }
};
module.exports = chatController;
