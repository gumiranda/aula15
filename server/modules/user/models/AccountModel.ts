import { ModelBase } from '../../../bin/base/ModelBase';

export class AccountModel implements ModelBase {
  _id: string;
  name: string;
  email: string;
  password: string;
  pushToken?: string;
}
