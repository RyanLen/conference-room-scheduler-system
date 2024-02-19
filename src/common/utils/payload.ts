import { User } from '../entities';
import { JwtUserPayload } from '../interfaces/jwt-user-payload';

export function createJwtUserPayload(user: User) {
  const roles = user.roles.map((item) => item.name);
  const permissions = user.roles.reduce((arr, item) => {
    item.permissions.forEach((permission) => {
      if (arr.indexOf(permission) === -1) {
        arr.push(permission);
      }
    });
    return arr;
  }, []);

  const payload: JwtUserPayload = {
    id: user.id,
    email: user.email,
    username: user.username,
    roles,
    permissions,
    isAdmin: user.isAdmin
  };

  return payload;
}
