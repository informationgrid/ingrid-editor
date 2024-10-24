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
import { EventEmitter, Injectable } from "@angular/core";
import { FrontendGroup, Group, UserResponse } from "../../models/user-group";
import { Observable } from "rxjs";
import { GroupDataService } from "./group-data.service";
import { map, tap } from "rxjs/operators";
import { FrontendUser, User } from "../../+user/user";
import { GroupStore } from "../../store/group/group.store";
import { ConfigService } from "../config/config.service";

@Injectable({
  providedIn: "root",
})
export class GroupService {
  // selectedGroup$: BehaviorSubject<Group>;
  forceReload$ = new EventEmitter<void>();

  constructor(
    private configService: ConfigService,
    private dataService: GroupDataService,
    private groupStore: GroupStore,
  ) {
    // this.selectedGroup$ = new BehaviorSubject<Group>(null);
  }

  getGroups(): void {
    this.dataService
      .getGroups()
      .pipe(
        map((groups) => groups.map(GroupService.convertFrontendGroup)),
        tap((groups) => this.groupStore.set(groups)),
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

  getUsersOfGroup(id: number): Observable<FrontendUser[]> {
    return this.dataService.getUserResponseOfGroup(id).pipe(
      map((urs) =>
        urs.map((ur) => {
          let user = GroupService.convertUserResponse(ur);
          // disable active user, as he cannot be edited in user view
          if (user.login === this.configService.$userInfo.getValue().login) {
            user.readOnly = true;
          }
          return user;
        }),
      ),
    );
  }

  private static convertUserResponse(userResponse: UserResponse): FrontendUser {
    return <FrontendUser>{
      ...userResponse.user,
      readOnly: userResponse.readOnly,
    };
  }

  setActive(id: number) {
    this.groupStore.setActive(id);
  }
}
