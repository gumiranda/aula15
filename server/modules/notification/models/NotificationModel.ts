import { ModelBase } from '../../../bin/base/ModelBase';

export class NotificationModel implements ModelBase {
  _id: string;
  userBy: string;
  userFor: string;
  content: string;
  read?: boolean;
}
