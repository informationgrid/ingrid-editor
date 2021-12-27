import { Injectable } from "@angular/core";
import { EntityState, EntityStore, StoreConfig } from "@datorama/akita";
import { Group } from "../../models/user-group";

export interface GroupState extends EntityState<Group> {}

@Injectable({ providedIn: "root" })
@StoreConfig({ name: "group" })
export class GroupStore extends EntityStore<GroupState, Group> {
  constructor() {
    super();
  }
}
