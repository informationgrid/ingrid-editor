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
import { Injectable } from "@angular/core";
import { TreeNode } from "../../store/tree/tree-node.model";
import { ProfileService } from "../profile.service";
import { DoctypeAbstract } from "../../store/doctype/doctype.model";

@Injectable({
  providedIn: "root",
})
export class DocBehavioursService {
  private disabledCondition = (
    forAddress: boolean,
    node: TreeNode,
    typeToInsert: string = null,
  ) => {
    if (this.hasNoWritePermission(node)) return true;

    if (forAddress) {
      const doctype = this.profileService.getDoctype(node.type);
      return (
        doctype.addressType === "person" ||
        (typeToInsert === "FOLDER" && node.type !== "FOLDER")
      );
    }
    return node.type !== "FOLDER";
  };

  private hasNoWritePermission(node: TreeNode) {
    return !node.hasWritePermission && !node.hasOnlySubtreeWritePermission;
  }

  private disabledConditionAlternative;

  private showOnlyFoldersInTree = (forAddress: boolean) => !forAddress;
  // TODO override/use
  private showOnlyFoldersInTreeAlternative;

  constructor(private profileService: ProfileService) {}

  registerDisabledConditionFunction(fn) {
    if (fn !== null && this.disabledConditionAlternative != null) {
      console.error(
        "There are multiple DisabledCondition functions registered for the tree. Will ignore others!",
      );
    } else {
      this.disabledConditionAlternative = fn;
    }
  }

  registerShowOnlyFoldersInTreeAlternativeFunction(fn) {
    if (fn !== null && this.showOnlyFoldersInTreeAlternative != null) {
      console.error(
        "There are multiple showOnlyFoldersInTreeAlternative functions registered for the tree. Will ignore others!",
      );
    } else {
      this.showOnlyFoldersInTreeAlternative = fn;
    }
  }

  cannotAddDocumentBelow() {
    return this.disabledConditionAlternative || this.disabledCondition;
  }

  showOnlyFoldersInTreeForDestinationSelection(forAddress: boolean): boolean {
    console.warn(this.showOnlyFoldersInTreeAlternative);
    return this.showOnlyFoldersInTreeAlternative
      ? this.showOnlyFoldersInTreeAlternative(forAddress)
      : this.showOnlyFoldersInTree(forAddress);
  }

  filterDocTypesByParent(types: DoctypeAbstract[], parent: number) {
    // TODO: reimplement this?
    // const parentType = this.tree.getEntity(parent)._type;
    // const profile = this.profileService.getProfile(parentType);
    // if (profile.addressType === "organization") {
    //   return types.filter((type) => type.addressType === "person");
    // }
    return types;
  }
}
