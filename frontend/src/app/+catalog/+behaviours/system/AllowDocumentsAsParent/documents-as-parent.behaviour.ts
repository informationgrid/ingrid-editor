/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import { Plugin } from "../../plugin";
import { inject, Injectable } from "@angular/core";
import { PluginService } from "../../../../services/plugin/plugin.service";
import { DocBehavioursService } from "../../../../services/event/doc-behaviours.service";
import { TreeNode } from "../../../../store/tree/tree-node.model";
import { ProfileService } from "../../../../services/profile.service";

@Injectable({ providedIn: "root" })
export class DocumentsAsParentBehaviour extends Plugin {
  id = "plugin.documents.as.parent";
  name = "Anlegen von Datensätzen unterhalb anderer Datensätze erlauben";
  group = "Baum";
  description =
    "Erlaubt das Anlegen von Datensätzen unterhalb von anderen Datensätzen. Standardmäßig ist dies nur unterhalb von Ordnern und bei Adressen zusätzlich unter Organisationen möglich.";
  defaultActive = false;

  private docBehavioursService = inject(DocBehavioursService);
  private profileService = inject(ProfileService);

  constructor() {
    super();
    inject(PluginService).registerPlugin(this);
  }

  register() {
    super.register();
    this.docBehavioursService.registerDisabledConditionFunction(
      this.disabledCondition,
    );
    this.docBehavioursService.registerShowOnlyFoldersInTreeAlternativeFunction(
      () => false,
    );
  }

  unregister() {
    super.unregister();
  }

  private disabledCondition = (
    forAddress: boolean,
    node: TreeNode,
    typeToInsert: string = null,
  ): boolean => {
    const doctype = this.profileService.getDoctype(node.type);
    const hasNoWritePermissionOnParent =
      !node.hasWritePermission && !node.hasOnlySubtreeWritePermission;
    const folderBelowDocument =
      typeToInsert === "FOLDER" && node.type !== "FOLDER";
    const parentIsPerson = forAddress && doctype.addressType === "person";

    return (
      hasNoWritePermissionOnParent || folderBelowDocument || parentIsPerson
    );
  };
}
