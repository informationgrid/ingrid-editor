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
        profile.addressType === "person" ||
        (typeToInsert === "FOLDER" && node.type !== "FOLDER")
      );
    }
    return node.type !== "FOLDER";
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
