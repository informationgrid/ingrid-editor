import { EventEmitter, Injectable } from "@angular/core";
import { FrontendGroup, Group } from "../../models/user-group";
import { BehaviorSubject, Observable } from "rxjs";
import { GroupDataService } from "./group-data.service";
import { map, tap } from "rxjs/operators";
import { User } from "../../+user/user";
import { GroupStore } from "../../store/group/group.store";

@Injectable({
  providedIn: "root",
})
export class GroupService {
  // selectedGroup$: BehaviorSubject<Group>;
  forceReload$ = new EventEmitter<boolean>();

  constructor(
    private dataService: GroupDataService,
    private groupStore: GroupStore
  ) {
    // this.selectedGroup$ = new BehaviorSubject<Group>(null);
  }

  getGroups(): void {
    this.dataService
      .getGroups()
      .pipe(
        map((groups) => groups.map(GroupService.convertFrontendGroup)),
        tap((groups) => this.groupStore.set(groups))
      )
      .subscribe();
  }

  getGroup(id: number): Observable<Group> {
    return this.dataService
      .getGroup(id)
      .pipe(map(GroupService.convertFrontendGroup));
  }

  private static convertFrontendGroup(frontendGroup: FrontendGroup): Group {
    return <Group>{
      ...frontendGroup.backendGroup,
      currentUserIsMember: frontendGroup.currentUserIsMember,
    };
  }

  getGroupManager(id: number): Observable<User> {
    return this.dataService.getGroupManager(id);
  }

  updateGroupManager(id: number, managerId: string): Observable<User> {
    return this.dataService.updateGroupManager(id, managerId);
  }

  updateGroup(group: Group): Observable<any> {
    // TODO: after saving group reassign group to active user. Necessary? User should not edit his own group!!!
    return this.dataService
      .saveGroup(group)
      .pipe(tap((response) => this.groupStore.update(group.id, response)));
  }

  createGroup(group: Group): Observable<Group> {
    return this.dataService
      .createGroup(group)
      .pipe(tap((response) => this.groupStore.add(response)));
  }

  // delete group metadata from backend
  deleteGroup(id: number): Observable<any> {
    return this.dataService
      .deleteGroup(id)
      .pipe(tap(this.groupStore.remove(id)));
  }

  getUsersOfGroup(id: number): Observable<User[]> {
    return this.dataService.getUsersOfGroup(id);
  }

  setActive(id: number) {
    this.groupStore.setActive(id);
  }
}
