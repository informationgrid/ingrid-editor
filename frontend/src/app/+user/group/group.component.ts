import { AfterViewInit, Component, OnInit } from "@angular/core";
import { ModalService } from "../../services/modal/modal.service";
import { GroupService } from "../../services/role/group.service";
import { FrontendGroup, Group } from "../../models/user-group";
import { Observable, of } from "rxjs";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
} from "@angular/forms";
import { BackendUser, Permissions, User } from "../user";
import { map, tap } from "rxjs/operators";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../dialogs/confirm/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { NewGroupDialogComponent } from "./new-group-dialog/new-group-dialog.component";
import { UserManagementService } from "../user-management.service";
import { SessionQuery } from "../../store/session.query";
import { EditManagerDialogComponent } from "../user/edit-manager-dialog/edit-manager-dialog.component";
import { ConfigService } from "../../services/config/config.service";

@UntilDestroy()
@Component({
  selector: "ige-group-manager",
  templateUrl: "./group.component.html",
  styleUrls: ["../user.styles.scss"],
})
export class GroupComponent implements OnInit, AfterViewInit {
  groups: Group[] = [];
  userGroupNames: string[];
  searchQuery: string;

  userInfo$ = this.configService.$userInfo;

  form: FormGroup;

  // TODO: what is the use of this form control?
  selectedGroupForm = new FormControl();
  selectedGroup: FrontendGroup;
  isLoading = false;
  showMore = false;
  tableWidth: number;

  constructor(
    private modalService: ModalService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    public groupService: GroupService,
    private configService: ConfigService,
    public userManagementService: UserManagementService,
    private session: SessionQuery
  ) {
    this.searchQuery = "";
    this.tableWidth = this.session.getValue().ui.userTableWidth;
  }

  ngAfterViewInit(): void {
    this.tableWidth = this.session.getValue().ui.userTableWidth;
  }

  ngOnInit() {
    this.fetchGroups()
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        // select group after groups are fetched, otherwise table has no data
        // to select from
        this.groupService.selectedGroup$.subscribe((group) => {
          const previousId = this.selectedGroup?.id;
          this.selectedGroup = group;
          if (group && previousId !== group.id) {
            this.form.reset(group);
            this.form.markAsPristine();
          }
        });
      });

    this.userInfo$
      .pipe(untilDestroyed(this))
      .subscribe((info) => (this.userGroupNames = info.groups));

    this.form = this.fb.group({
      id: [],
      name: ["", this.forbiddenNameValidator()],
      description: [],
      permissions: [],
    });

    if (this.groupService.selectedGroup$.value) {
      this.loadGroup(this.groupService.selectedGroup$.value.id);
    }
  }

  fetchGroups(): Observable<Group[]> {
    const currentValue = this.selectedGroupForm.value;
    return this.groupService.getGroups().pipe(
      tap((groups) => (this.groups = groups)),
      tap(() => setTimeout(() => this.selectedGroupForm.setValue(currentValue)))
    );
  }

  openAddGroupDialog() {
    this.dirtyFormHandled().subscribe((allClear) => {
      if (allClear)
        this.dialog
          .open(NewGroupDialogComponent, { hasBackdrop: true })
          .afterClosed()
          .subscribe((group) => {
            if (group?.id) {
              this.form.markAsPristine();
              this.fetchGroups().subscribe(() => this.loadGroup(group.id));
            }
          });
    });
  }

  loadGroup(id: number) {
    this.dirtyFormHandled().subscribe((confirmed) => {
      if (confirmed) {
        this.isLoading = true;
        this.form.disable();
        this.groupService.getGroup(id).subscribe((fetchedGroup) => {
          if (!fetchedGroup.permissions) {
            fetchedGroup.permissions = new Permissions();
          }
          this.groupService.selectedGroup$.next(fetchedGroup);
          this.form.enable();
          this.isLoading = false;
          this.groupService.getGroupManager(id).subscribe((manager) => {
            if (this.selectedGroup) this.selectedGroup.manager = manager.login;
          });
        });
      } else {
        this.groupService.selectedGroup$.next(this.selectedGroup);
      }
    });
  }

  saveGroup(): void {
    const group = this.form.value;
    this.groupService.updateGroup(group).subscribe((group) => {
      if (group) {
        this.groupService.selectedGroup$.next(group);
        this.form.markAsPristine();
        this.loadGroup(group.id);
      }
      this.fetchGroups()
        .pipe(tap(() => this.form.markAsPristine()))
        .subscribe();
    });
  }

  async deleteGroup(id: number) {
    this.groupService.getUsersOfGroup(id).subscribe((users) => {
      const data = GroupComponent.createDeleteDialogData(users);

      this.dialog
        .open(ConfirmDialogComponent, {
          data: data,
        })
        .afterClosed()
        .subscribe((result) => {
          if (result) {
            this.groupService.deleteGroup(id).subscribe(() => {
              this.fetchGroups()
                .pipe(tap(() => this.groupService.selectedGroup$.next(null)))
                .subscribe();
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
                    ? "ist ein Nutzer"
                    : "sind " + users.length + " Nutzer"
                } der Gruppe zugeordnet:`
              : "Es sind aktuell keine Nutzer der Gruppe zugeordnet",
          list: users.map(
            // (user) => `${user.firstName} ${user.lastName} (${user.login})`
            (user) => user.login
          ),
        },
      });
    });
  }

  forbiddenNameValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const forbidden =
        this.groups.filter(
          (group) =>
            group.name === control.value && group.id !== this.selectedGroup?.id
        ).length > 0;

      return forbidden ? { forbiddenName: { value: control.value } } : null;
    };
  }

  private static createDeleteDialogData(users: User[]): ConfirmDialogData {
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
          ? `Möchten Sie die Gruppe wirklich löschen? Die Gruppe wird von ${
              users.length === 1 ? "einem Nutzer" : users.length + " Nutzern"
            } verwendet:`
          : "Möchten Sie die Gruppe wirklich löschen?",
      list: users.map((user) => user.login),
    };
  }

  dirtyFormHandled(): Observable<boolean> {
    if (this.form.dirty) {
      return this.dialog
        .open(ConfirmDialogComponent, {
          data: (<ConfirmDialogData>{
            title: "Änderungen verwerfen?",
            message: "Wollen Sie die Änderungen verwerfen?",
            buttons: [
              { text: "Abbrechen" },
              {
                text: "Verwerfen",
                id: "discard",
                alignRight: true,
                emphasize: true,
              },
            ],
          }) as ConfirmDialogData,
          hasBackdrop: true,
        })
        .afterClosed()
        .pipe(map((response) => response === "discard"));
    }

    return of(true);
  }

  openChangeManagerDialog(): void {
    this.dirtyFormHandled().subscribe((allClear) => {
      if (allClear) {
        this.groupService
          .getGroupManager(this.selectedGroup.id)
          .subscribe((manager) => {
            this.dialog
              .open(EditManagerDialogComponent, {
                data: {
                  user: new BackendUser({
                    // current user who is editing
                    login: this.configService.$userInfo.getValue().userId,
                    // current group manager
                    manager: manager.login,
                  }),
                  group: this.selectedGroup,
                },
                hasBackdrop: true,
              })
              .afterClosed()
              .subscribe((result) => {
                if (result?.manager) {
                  this.groupService
                    .updateGroupManager(this.selectedGroup.id, result.manager)
                    .subscribe(
                      () => (this.selectedGroup.manager = result.manager)
                    );
                }
              });
          });
      }
    });
  }
}
