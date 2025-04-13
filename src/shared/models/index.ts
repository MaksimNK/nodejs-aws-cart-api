import { Request } from 'express';
import { User } from 'src/users/user.entity';
export interface AppRequest extends Request {
  user?: User;
}
