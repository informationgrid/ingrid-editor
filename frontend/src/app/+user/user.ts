/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */

export abstract class User {
  id: number;
  login: string;
  firstName: string;
  lastName: string;
  role: string;
  organisation: string;
  department: string;
  attributes: any[];
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

  constructor(user?: BackendUser) {
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

// user that is assigned with permission to an individual doc.
export class UserWithDocPermission extends User {
  permission: PermissionLevel;

  constructor(user: User, permission: PermissionLevel) {
    super(user);
    this.permission = permission;
  }
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
  /** Write Access to subtree */
  WRITE_EXCEPT_PARENT = "writeTreeExceptParent",
  /** Read Access to whole tree */
  READ = "readTree",
}
