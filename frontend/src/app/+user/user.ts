import { SelectOption } from "../services/codelist/codelist.service";
import { Group } from "../models/user-group";

export abstract class User {
  id: number;
  login: string;
  firstName: string;
  lastName: string;
  role: string;
  organisation: string;
  department: string;
  attributes: any[];
  password?: string;
  creationDate: Date;
  modificationDate: Date;
  latestLogin?: Date;
  email?: string;
  phoneNumber?: string;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}

export class FrontendUser extends User {
  permissions?: Permissions;
  groups?: { key: string; value?: string }[];
  readOnly?: boolean;

  constructor(user?: BackendUser, igeGroups?: Group[]) {
    super(user);

    if (user) {
      this.groups = user.groups?.map((groupId) => ({ key: groupId + "" }));
    }
  }
}

export class BackendUser extends User {
  permissions?: Permissions;
  groups?: number[];
}

export class Permissions {
  rootPermission?: "READ" | "WRITE";
  documents: TreePermission[] = [];
  addresses: TreePermission[] = [];
}

export class TreePermission {
  id: number;
  title: string;
  isFolder: boolean;
  permission: string; // TODO: still used?
  hasWritePermission: boolean;
  hasOnlySubtreeWritePermission: boolean;
  iconClass?: string; // either "UvpOrganisationDoc" or "UvpAddressDoc"
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
