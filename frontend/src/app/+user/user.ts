export abstract class User {
  login: string;
  firstName: string;
  lastName: string;
  role: string;
  organisation: string;
  attributes: any[];
  password?: string;
  manager?: string;
  standin?: string;
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

  constructor(user?: BackendUser) {
    super(user);

    /*const perms = user?.permissions;
    this.permissions = {
      pages: perms?.pages ?? {},
      actions: perms?.actions ?? {},
      documents: perms?.documents ?? [],
      addresses: perms?.addresses ?? []
    };*/
  }
}

export class BackendUser extends User {
  permissions?: Permissions;
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
