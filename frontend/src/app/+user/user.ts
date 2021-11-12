import { SelectOption } from "../services/codelist/codelist.service";
import { Group } from "../models/user-group";

export abstract class User {
  login: string;
  firstName: string;
  lastName: string;
  role: string;
  organisation: string;
  attributes: any[];
  password?: string;
  creationDate: Date;
  modificationDate: Date;
  latestLogin?: Date;
  email?: string;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}

export class FrontendUser extends User {
  permissions?: Permissions;
  groups?: SelectOption[];

  constructor(user?: BackendUser, igeGroups?: Group[]) {
    super(user);

    if (user) {
      this.groups = user.groups?.map(
        (groupId) => new SelectOption(groupId + "", null)
      );
    }
  }
}

export class BackendUser extends User {
  permissions?: Permissions;
  groups?: number[];
}

export class Permissions {
  pages: { [x: string]: boolean } = {};
  actions: { [x: string]: boolean } = {};
  documents: TreePermission[] = [];
  addresses: TreePermission[] = [];
}

export class TreePermission {
  uuid: string;
  title: string;
  permission: string;
}

export enum PermissionType {
  PAGE,
  ACTION,
  DOCUMENTS,
  ADDRESSES,
}

export enum PermissionLevel {
  /** Write Access to whole tree */
  WRITE = "writeTree",
  /** Write Access to sub tree*/
  WRITE_EXCEPT_PARENT = "writeTreeExceptParent",
  /** Read Access to whole tree */
  READ = "readTree",
}
