/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
import { TreeActionType } from "./tree.component";
import { NodePermission } from "../../../models/path-response";

export class ShortTreeNode {
  constructor(
    public id: number,
    public title: string,
    public permission: NodePermission = {
      canRead: false,
      canWrite: true,
      canOnlyWriteSubtree: false,
    },
    public disabled = false,
  ) {}

  isSelectable() {
    return (
      !this.disabled ||
      this.permission?.canOnlyWriteSubtree ||
      this.permission?.canRead
    );
  }
}

export class TreeAction {
  constructor(
    public type: TreeActionType,
    public id: number,
  ) {}
}
