import { Permissions } from "../+user/user";

export class Group {
  id: number;
  name: string;
  description: string;
  permissions: Permissions;
  data: GroupData;
  currentUserIsMember?: boolean;

  constructor(values: Object = {}) {
    this.init();
    Object.assign(this, values);
  }

  private init() {
    this.permissions = new Permissions();
  }
}

export class FrontendGroup {
  backendGroup: Group;
  currentUserIsMember?: boolean;
}

export class GroupData {
  creationDate: Date;
  modificationDate: Date;
}
