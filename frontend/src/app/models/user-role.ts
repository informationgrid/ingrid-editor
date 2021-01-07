import {Permissions} from '../+user/user';

export class RoleAttribute {
  id: string;
  value: string;
}

export class Role {
  id: string;
  name: string;
  permissions: Permissions;

  constructor(values: Object = {}) {
    this.init();
    Object.assign( this, values );
  }

  private init() {
    this.permissions = new Permissions();
  }
}
