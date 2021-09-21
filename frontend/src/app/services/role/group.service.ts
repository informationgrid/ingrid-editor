import { Injectable } from "@angular/core";
import { Group } from "../../models/user-group";
import { Observable } from "rxjs";
import { GroupDataService } from "./group-data.service";
import { map } from "rxjs/operators";
import { User } from "../../+user/user";

@Injectable({
  providedIn: "root",
})
export class GroupService {
  constructor(private dataService: GroupDataService) {}

  getGroups(): Observable<Group[]> {
    return this.dataService.getGroups();
  }

  getGroup(id: number): Observable<Group> {
    return this.dataService
      .getGroup(id)
      .pipe(map((json) => this.prepareGroup([json])[0]));
  }

  getGroupManager(id: number): Observable<User> {
    return this.dataService.getGroupManager(id);
  }

  updateGroupManager(id: number, managerId: string): Observable<User> {
    return this.dataService.updateGroupManager(id, managerId);
  }

  prepareGroup(groups: any[]) {
    return groups.map((group) => new Group(group));
  }

  updateGroup(group: Group): Observable<any> {
    // TODO: after saving group reassign group to active user. Necessary? User should not edit his own group!!!
    return this.dataService.saveGroup(group);
  }

  createGroup(group: Group): Observable<Group> {
    return this.dataService.createGroup(group);
  }

  // delete group metadata from backend
  deleteGroup(id: number): Observable<any> {
    return this.dataService.deleteGroup(id);
  }

  getUsersOfGroup(id: number): Observable<User[]> {
    return this.dataService.getUsersOfGroup(id);
  }
}
