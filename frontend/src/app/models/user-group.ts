import { Permissions } from "../+user/user";
import { GroupModel } from "../store/group/group.model";

export class Group implements GroupModel {
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
  manager?: String;
}

export class GroupData {
  creationDate: Date;
  modificationDate: Date;
}
