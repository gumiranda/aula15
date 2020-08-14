import { Router } from 'express';
import controller from '../controllers/chat-controller';
import { auth } from '../../../middlewares/authentication';

const _ctrl = new controller();
export default (router: Router): void => {
  router.post('/', auth, _ctrl.post);
  router.put('/delete/:id/:id2', auth, _ctrl.deleteMessage); //id é do chat e id 2 eh da mensagem
  router.get('/page/:page', auth, _ctrl.getMyChats);
  router.get('/:id/page/:page', auth, _ctrl.getByIdPaginate);
  router.put('/send/:id', auth, _ctrl.sendMessage);
  router.delete('/:id', auth, _ctrl.delete);
};
