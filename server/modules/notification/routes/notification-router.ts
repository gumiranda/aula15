import { Router } from 'express';
import controller from '../controllers/notification-controller';
import { auth } from '../../../middlewares/authentication';

const _ctrl = new controller();
export default (router: Router): void => {
  router.get('/', auth, _ctrl.get);
  router.get('/:id', auth, _ctrl.getById);
  router.get('/page/:page', auth, _ctrl.getMy);
  router.post('/', auth, _ctrl.post);
  router.put('/:id', auth, _ctrl.put);
  router.delete('/:id', auth, _ctrl.delete);
};
