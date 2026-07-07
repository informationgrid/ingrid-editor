/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
import { Injectable } from "@angular/core";
import { TreeNode } from "../../../../store/tree/tree-node.model";
import { DocumentAbstract } from "../../../../store/document/document.model";

@Injectable({ providedIn: "root" })
export class DeleteReferenceHandlerService {
  private disabledConditionAlternative?;

  cannotReplaceWithAddress = (source: DocumentAbstract, node: TreeNode) => {
    return (
      this.disabledConditionAlternative?.(source, node) ??
      this.disabledCondition(source, node)
    );
  };

  private disabledCondition = (source: DocumentAbstract, node: TreeNode) => {
    return node._uuid === source._uuid || node.state === "W";
  };

  registerDisabledConditionFunction(fn) {
    if (fn != null && this.disabledConditionAlternative != null) {
      console.error(
        "There are multiple DisabledCondition functions registered for the tree. Will ignore others!",
      );
    } else {
      this.disabledConditionAlternative = fn;
    }
  }
}
