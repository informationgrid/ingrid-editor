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
import { Injectable } from "@angular/core";
import { TreeNode } from "../../store/tree/tree-node.model";
import { ProfileService } from "../profile.service";
import { ProfileAbstract } from "../../store/profile/profile.model";

@Injectable({
  providedIn: "root",
})
export class DocBehavioursService {
  private disabledCondition = (
    forAddress: boolean,
    node: TreeNode,
    typeToInsert: string = null,
  ) => {
    if (forAddress) {
      const profile = this.profileService.getProfile(node.type);
      return (
        (!node.hasWritePermission && !node.hasOnlySubtreeWritePermission) ||
        profile.addressType === "person" ||
        (typeToInsert === "FOLDER" && node.type !== "FOLDER")
      );
    }
    return (
      (!node.hasWritePermission && !node.hasOnlySubtreeWritePermission) ||
      node.type !== "FOLDER"
    );
  };
  private disabledConditionAlternative;

  private showOnlyFoldersInTree = (forAddress: boolean) => !forAddress;
  private showOnlyFoldersInTreeAlternative;

  constructor(private profileService: ProfileService) {}

  registerFunction(type: "disabledCondition", fn) {
    const altName = type + "Alternative";
    if (fn !== null && this[altName] !== null) {
      console.error(
        "There are multiple sort functions registered for the tree. Will ignore others!",
      );
    } else {
      this[altName] = fn;
    }
  }

  cannotAddDocumentBelow() {
    return this.disabledConditionAlternative || this.disabledCondition;
  }

  showOnlyFoldersInTreeForDestinationSelection(forAddress: boolean): boolean {
    return this.showOnlyFoldersInTreeAlternative
      ? this.showOnlyFoldersInTreeAlternative(forAddress)
      : this.showOnlyFoldersInTree(forAddress);
  }

  filterDocTypesByParent(types: ProfileAbstract[], parent: number) {
    /*const parentType = this.tree.getEntity(parent)._type;
    const profile = this.profileService.getProfile(parentType);
    if (profile.addressType === "organization") {
      return types.filter((type) => type.addressType === "person");
    }
    return types;*/
    return types;
  }
}
