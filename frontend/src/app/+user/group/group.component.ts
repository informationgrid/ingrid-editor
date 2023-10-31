import { AfterViewInit, Component, OnInit } from "@angular/core";
import { GroupService } from "../../services/role/group.service";
import { Group } from "../../models/user-group";
import { Observable, of } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";
import {
  AbstractControl,
  FormControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  ValidatorFn,
} from "@angular/forms";
import { Permissions, User } from "../user";
import { filter, map, tap } from "rxjs/operators";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../dialogs/confirm/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { NewGroupDialogComponent } from "./new-group-dialog/new-group-dialog.component";
import { UserManagementService } from "../user-management.service";
import { SessionQuery } from "../../store/session.query";
import { ConfigService } from "../../services/config/config.service";
import { UserService } from "../../services/user/user.service";
import { Router } from "@angular/router";
import { GroupQuery } from "../../store/group/group.query";

@UntilDestroy()
@Component({
  selector: "ige-group-manager",
  templateUrl: "./group.component.html",
  styleUrls: ["../user.styles.scss"],
})
export class GroupComponent implements OnInit, AfterViewInit {
  groups = this.groupQuery
    .selectAll()
    .pipe(tap((response) => (this._groups = response)));
  userGroupNames: string[];

  userInfo$ = this.configService.$userInfo;
  userHasRootReadPermission: boolean = false;
  userHasRootWritePermission: boolean = false;

  form: UntypedFormGroup;

  selectedGroup: Group;
  isLoading = false;
  showMore = false;
  tableWidth: number;
  groupUsers: User[];
  query = new FormControl<string>("");
  private _groups: Group[];
  private previousGroupId: number;

  constructor(
    private fb: UntypedFormBuilder,
    private dialog: MatDialog,
    public groupService: GroupService,
    private configService: ConfigService,
    public userManagementService: UserManagementService,
    public userService: UserService,
    private router: Router,
    private session: SessionQuery,
    public groupQuery: GroupQuery,
    private snackBar: MatSnackBar,
  ) {
    this.tableWidth = this.session.getValue().ui.userTableWidth;
  }

  ngAfterViewInit(): void {
    this.tableWidth = this.session.getValue().ui.userTableWidth;
  }

  ngOnInit() {
    this.form = this.fb.group({
      id: [],
      name: ["", this.forbiddenNameValidator()],
      description: [],
      permissions: [],
    });

    this.groupService.forceReload$
      .pipe(untilDestroyed(this))
      .subscribe(() => this.loadGroup(this.previousGroupId));

    this.groupQuery
      .selectActiveId()
      .pipe(untilDestroyed(this))
      .subscribe((activeId) => {
        this.selectedGroup = this.groupQuery.getEntity(activeId);
        if (activeId !== null && this.previousGroupId !== activeId) {
          this.loadGroup(activeId);
        }
      });

    this.userInfo$.pipe(untilDestroyed(this)).subscribe((info) => {
      this.userGroupNames = info.groups;
      this.userHasRootWritePermission =
        this.configService.hasPermission("can_write_root");
      this.userHasRootReadPermission =
        this.configService.hasPermission("can_read_root");
    });
  }

  openAddGroupDialog() {
    this.dirtyFormHandled().subscribe((allClear) => {
      if (allClear)
        this.dialog
          .open(NewGroupDialogComponent, { hasBackdrop: true })
          .afterClosed()
          .pipe(
            filter((group) => group?.id),
            map((group) => JSON.parse(JSON.stringify(group))), // group needs to be extensible
          )
          .subscribe((group) => this.updateGroupOnPage(group));
    });
  }

  loadGroup(id: number) {
    this.dirtyFormHandled().subscribe((confirmed) => {
      if (confirmed) {
        this.previousGroupId = id;
        this.isLoading = true;
        this.form.disable();
        this.groupService
          .getGroup(id)
          .subscribe((fetchedGroup) => this.updateGroupOnPage(fetchedGroup));
      } else {
        this.groupService.setActive(this.previousGroupId);
      }
    });
  }

  private updateGroupOnPage(group: Group) {
    if (!group.permissions) {
      group.permissions = new Permissions();
    }
    this.selectedGroup = group;
    this.form.reset(group);
    this.form.markAsPristine();
    if (!group.currentUserIsMember) this.form.enable();
    this.isLoading = false;
    this.loadGroupUsers(group.id);
    this.groupService.setActive(group.id);
  }

  discardGroup(group: Group) {
    this.form.markAsPristine();
    this.form.enable();
    this.isLoading = false;
    this.loadGroupUsers(group.id);
    this.loadGroup(this.groupQuery.getActiveId());
    this.groupService.setActive(group.id);
  }

  saveGroup(setActive: boolean = true): void {
    const group = this.form.value;
    this.groupService
      .updateGroup(group)
      .pipe(
        filter((group) => group),
        map((group) => JSON.parse(JSON.stringify(group))),
      )
      .subscribe((group) => {
        if (group && setActive) {
          this.updateGroupOnPage(group);
          this.snackBar.open("Gruppe wurde gespeichert", "", {
            panelClass: "green",
          });
        }
      });
  }

  async deleteGroup(id: number) {
    this.groupService.getUsersOfGroup(id).subscribe((users) => {
      const group = this._groups.find((group) => group.id === id);
      const data = GroupComponent.createDeleteDialogData(users, group);

      this.dialog
        .open(ConfirmDialogComponent, {
          data: data,
        })
        .afterClosed()
        .subscribe((result) => {
          if (result) {
            this.groupService
              .deleteGroup(id)
              .pipe(filter(() => id === this.groupQuery.getActiveId()))
              .subscribe(() => {
                this.groupService.setActive(null);
              });
          }
        });
    });
  }

  async showGroupUsers(id: number) {
    this.groupService.getUsersOfGroup(id).subscribe((users) => {
      this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: "Gruppennutzer",
          message:
            users.length > 0
              ? `Aktuell ${
                  users.length === 1
                    ? "ist ein Benutzer"
                    : "sind " + users.length + " Benutzer"
                } der Gruppe zugeordnet:`
              : "Es sind aktuell keine Benutzer der Gruppe zugeordnet",
          list: users.map(
            // (user) => `${user.firstName} ${user.lastName} (${user.login})`
            (user) => user.login,
          ),
        },
      });
    });
  }

  forbiddenNameValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const forbidden =
        this._groups?.filter(
          (group) =>
            group.name === control.value && group.id !== this.selectedGroup?.id,
        )?.length > 0;

      return forbidden ? { forbiddenName: { value: control.value } } : null;
    };
  }

  private static createDeleteDialogData(
    users: User[],
    group: Group,
  ): ConfirmDialogData {
    return {
      title: "Gruppe löschen",
      buttons: [
        {
          text: "Abbrechen",
        },
        {
          text: "Gruppe löschen",
          alignRight: true,
          id: "confirm",
          emphasize: true,
        },
      ],
      message:
        users.length > 0
          ? `Möchten Sie die Gruppe "${
              group.name
            }" wirklich löschen? Die Gruppe wird von ${
              users.length === 1
                ? "einem Benutzer"
                : users.length + " Benutzern"
            } verwendet:`
          : `Möchten Sie die Gruppe "${group.name}" wirklich löschen?`,
      list: users.map((user) => user.login),
    };
  }

  dirtyFormHandled(): Observable<boolean> {
    if (this.form.dirty) {
      return this.dialog
        .open(ConfirmDialogComponent, {
          data: (<ConfirmDialogData>{
            title: "Änderungen speichern?",
            message:
              "Es wurden Änderungen an der ausgewählten Gruppe vorgenommen.\nMöchten Sie die Änderungen speichern?",
            buttons: [
              { text: "Abbrechen" },
              {
                text: "Verwerfen",
                id: "discard",
                alignRight: true,
              },
              {
                text: "Speichern",
                id: "save",
                alignRight: true,
                emphasize: true,
              },
            ],
          }) as ConfirmDialogData,
          hasBackdrop: true,
        })
        .afterClosed()
        .pipe(
          tap((response) => (response ? this.handleAction(response) : null)),
          map((response) => response === "discard" || response === "save"),
        );
    }

    return of(true);
  }

  private async handleAction(action: undefined | "save" | "discard") {
    if (action === "save") {
      this.saveGroup(false);
    } else if (action === "discard") {
      const group = this.form.value;
      this.form.reset(group);
    } else {
      // do nothing
    }
  }

  private loadGroupUsers(id: number) {
    this.groupService
      .getUsersOfGroup(id)
      .subscribe(
        (users) =>
          (this.groupUsers = users.sort((a, b) =>
            a.login.localeCompare(b.login),
          )),
      );
  }

  switchToUser($event: User) {
    this.userService.selectedUser$.next($event);
    this.router.navigate([`${ConfigService.catalogId}/manage/user`]);
  }
}
