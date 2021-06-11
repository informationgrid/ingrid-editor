import { Permissions } from "../+user/user";

export class Group {
  id: string;
  name: string;
  description: string;
  permissions: Permissions;

  constructor(values: Object = {}) {
    this.init();
    Object.assign(this, values);
  }

  private init() {
    this.permissions = new Permissions();
  }
}
