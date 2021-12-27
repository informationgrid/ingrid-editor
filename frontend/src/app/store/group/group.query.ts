import { Injectable } from "@angular/core";
import { QueryEntity } from "@datorama/akita";
import { GroupStore, GroupState } from "./group.store";
import { Group } from "../../models/user-group";

@Injectable({
  providedIn: "root",
})
export class GroupQuery extends QueryEntity<GroupState, Group> {
  constructor(protected store: GroupStore) {
    super(store);
  }
}
