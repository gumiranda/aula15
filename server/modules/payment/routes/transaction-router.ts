import { Router } from 'express';
import controller from '../controllers/transaction-controller';
import { auth } from '../../../middlewares/authentication';

const _ctrl = new controller();
export default (router: Router): void => {
  router.get('/', auth, _ctrl.get);
  router.post('/', auth, _ctrl.post);
  router.delete('/:id', auth, _ctrl.delete);
};
