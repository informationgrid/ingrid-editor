import { Permissions } from "../+user/user";

export class Group {
  id: number;
  name: string;
  description: string;
  permissions: Permissions;
  data: GroupData;

  constructor(values: Object = {}) {
    this.init();
    Object.assign(this, values);
  }

  private init() {
    this.permissions = new Permissions();
  }
}

export class FrontendGroup extends Group {
  manager?: string;
}

export class GroupData {
  creationDate: Date;
  modificationDate: Date;
}
