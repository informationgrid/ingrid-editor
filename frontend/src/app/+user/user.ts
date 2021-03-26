export abstract class User {
  login: string;
  firstName: string;
  lastName: string;
  role: string;
  attributes: any[];
  password?: string;
  manager?: string;
  standin?: string;
  creationDate: Date;
  modificationDate: Date;
  latestLogin?: Date;

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

export class Permission {
  type: PermissionType;
  key: string;
  value: string;
}

export class TreePermission {
  uuid;
  title;
  permission;
}

export enum PermissionType {
  PAGE, ACTION, DOCUMENTS, ADDRESSES
}
