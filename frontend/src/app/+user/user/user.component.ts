import { FormlyFieldConfig } from "@ngx-formly/core";

import {
  AfterContentChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
} from "@angular/core";
import { ModalService } from "../../services/modal/modal.service";
import { UserService } from "../../services/user/user.service";
import { FrontendUser, User } from "../user";
import { Observable, of } from "rxjs";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { GroupService } from "../../services/role/group.service";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { NewUserDialogComponent } from "./new-user-dialog/new-user-dialog.component";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../dialogs/confirm/confirm-dialog.component";
import { filter, map, tap } from "rxjs/operators";
import { UserManagementService } from "../user-management.service";
import { SessionQuery } from "../../store/session.query";
import { MatSnackBar } from "@angular/material/snack-bar";
import { EditManagerDialogComponent } from "./edit-manager-dialog/edit-manager-dialog.component";
import { ConfigService } from "../../services/config/config.service";
import { Router } from "@angular/router";

@UntilDestroy()
@Component({
  selector: "ige-user-manager",
  templateUrl: "./user.component.html",
  styleUrls: ["../user.styles.scss"],
})
export class UserComponent
  implements OnInit, AfterViewInit, AfterContentChecked
{
  users: User[];
  currentTab: string;
  form = new FormGroup({});

  selectedUser: User;
  showMore = false;
  searchQuery: string;
  isLoading = false;
  formlyFieldConfig: FormlyFieldConfig[];
  model: User;
  tableWidth: number;
  selectedUserRole: string;

  constructor(
    private modalService: ModalService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    public userService: UserService,
    private groupService: GroupService,
    private configService: ConfigService,
    private router: Router,
    public userManagementService: UserManagementService,
    private session: SessionQuery,
    private snackBar: MatSnackBar,
    private cdRef: ChangeDetectorRef
  ) {
    this.model = new FrontendUser();
    this.searchQuery = "";
    this.formlyFieldConfig = this.userService.getUserFormFields(
      this.roleChangeCallback,
      this.groupSelectCallback
    );
    this.tableWidth = this.session.getValue().ui.userTableWidth;
  }

  groupSelectCallback = (groupId: number) =>
    this.groupService.getGroup(groupId).subscribe((group) => {
      this.groupService.selectedGroup$.next(group);
      this.router.navigate(["/manage/group"]);
    });

  roleChangeCallback = (field, $event) => {
    // user can only be downgraded to author if he is not a manager of any other users
    if ($event.value === "author") {
      this.userService
        .getManagedUsers(this.selectedUser.login)
        .subscribe((managedUsers) => {
          if (managedUsers.length > 0) {
            // reset role change as user is still a manager
            this.form.get("role").setValue(this.selectedUserRole);

            this.dialog.open(ConfirmDialogComponent, {
              data: {
                title: "Benutzer Rolle ändern",
                message:
                  "Die Rolle des Nutzers kann nicht geändert werden, da er noch für folgende Nutzer verantwortlich ist:\n\n" +
                  managedUsers.join("\n") +
                  "\n\nBitte geben Sie zunächst die Verantwortung des Nutzers ab.",
                buttons: [
                  {
                    text: "Schließen",
                    alignRight: true,
                    emphasize: true,
                  },
                ],
              } as ConfirmDialogData,
              hasBackdrop: true,
            });
          }
          this.selectedUserRole = this.form.get("role").value;
        });
    } else {
      this.selectedUserRole = this.form.get("role").value;
    }
  };

  ngAfterViewInit(): void {
    this.tableWidth = this.session.getValue().ui.userTableWidth;
  }

  ngAfterContentChecked(): void {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.currentTab = "users";

    this.fetchUsers().subscribe(() => {
      // select group after groups are fetched, otherwise table has no data
      // to select from
      this.userService.selectedUser$
        .pipe(
          filter((user) => !!user),
          tap((user) => {
            this.selectedUser = user;
            this.selectedUserRole = user.role;
          }),
          untilDestroyed(this)
        )
        .subscribe();
    });

    // load previously selected user
    if (this.userService.selectedUser$.value) {
      this.loadUser(this.userService.selectedUser$.value.login);
    }
  }

  // TODO: the belongs in the service
  fetchUsers(): Observable<FrontendUser[]> {
    return this.userService.getUsers().pipe(
      map((users: FrontendUser[]) =>
        users
          .filter(
            // remove current user from list
            (u) => u.login !== this.configService.$userInfo.getValue().userId
          )
          .sort((a, b) => a.login.localeCompare(b.login))
      ),
      tap((users) => (this.users = users ? users : [])),
      untilDestroyed(this)
    );
  }

  loadUser(login: string) {
    this.dirtyFormHandled().subscribe((confirmed) => {
      if (confirmed) {
        this.isLoading = true;
        this.form.disable();
        this.userService.getUser(login).subscribe((user) => {
          this.userService.selectedUser$.next(user);
          this.model = user;
          this.updateUserForm(user);
        });
      } else {
        this.userService.selectedUser$.next(this.selectedUser);
      }
    });
  }

  showAddUsersDialog() {
    this.dirtyFormHandled().subscribe((allClear) => {
      if (allClear)
        this.dialog
          .open(NewUserDialogComponent, { hasBackdrop: true })
          .afterClosed()
          .subscribe((result) => {
            if (result) {
              this.fetchUsers().subscribe();
              this.loadUser(result.login);
              this.snackBar.open("Registrierungs-E-Mail wurde versandt", "", {
                panelClass: "green",
              });
            }
          });
    });
  }

  deleteUser(login: string) {
    this.userService.getManagedUsers(login).subscribe((managedUsers) => {
      if (managedUsers?.length) {
        this.dialog.open(ConfirmDialogComponent, {
          data: {
            title: "Benutzer löschen",
            message:
              "Der Benutzer kann nicht gelöscht werden, da er noch für folgende Nutzer verantwortlich ist:\n\n" +
              managedUsers.join("\n") +
              "\n\nBitte geben Sie zunächst die Verantwortung des Nutzers ab.",
          } as ConfirmDialogData,
          hasBackdrop: true,
        });
      } else {
        this.dialog
          .open(ConfirmDialogComponent, {
            data: {
              title: "Benutzer löschen",
              message:
                "Möchten Sie den Benutzer " + login + " wirklich löschen?",
            } as ConfirmDialogData,
          })
          .afterClosed()
          .subscribe((result) => {
            if (result) {
              this.userService.deleteUser(login).subscribe(() => {
                this.userService.selectedUser$.next(null);
                this.selectedUser = null;
                this.fetchUsers().subscribe();
              });
            }
          });
      }
    });
  }

  changeManagerForManagedUsers(login: string) {
    this.userService.getManagedUsers(login).subscribe((managedUsers) => {
      if (managedUsers?.length) {
        this.dialog
          .open(ConfirmDialogComponent, {
            data: {
              title: "Verantwortung abgeben",
              message:
                "Der Benutzer ist aktuell für folgende Nutzer verantwortlich:\n\n" +
                managedUsers.join("\n") +
                "\n\nBitte wählen Sie im nächsten Schritt einen neuen Verantwortlichen",
              buttons: [
                { text: "Abbrechen" },
                {
                  text: "Verantwortlichen auswählen",
                  alignRight: true,
                  id: "confirm",
                  emphasize: true,
                },
              ],
            } as ConfirmDialogData,
          })
          .afterClosed()
          .subscribe((result) => {
            if (!result) return;
            this.dialog
              .open(EditManagerDialogComponent, {
                data: { user: this.selectedUser },
                hasBackdrop: true,
              })
              .afterClosed()
              .subscribe((result) => {
                if (result) {
                  const newManagerId = result.manager;
                  const promises = [];
                  managedUsers.forEach((userId) => {
                    promises.push(
                      this.userService
                        .updateManager(userId, newManagerId)
                        .toPromise()
                    );
                  });
                  Promise.all(promises).then(() =>
                    this.snackBar.open("Verantwortung geändert", "", {
                      panelClass: "green",
                    })
                  );
                }
              });
          });
      } else {
        this.dialog.open(ConfirmDialogComponent, {
          data: {
            title: "Verantwortung abgeben",
            message:
              "Der ausgewählte Benutzer ist für keine anderen Nutzer verantwortlich",
          } as ConfirmDialogData,
        });
      }
    });
  }

  saveUser(user?: User): void {
    let createUserObserver: Observable<User>;

    // convert roles to numbers
    // user.roles = user.roles.map(role => +role);
    this.form.disable();

    user = user ?? this.model;
    createUserObserver = this.userService.updateUser(user);

    // send request and handle error
    createUserObserver.subscribe(
      () => {
        this.fetchUsers().subscribe();
        this.enableForm();
        this.form.markAsPristine();
        this.loadUser(user.login);
      },
      (err: any) => {
        this.enableForm();
        this.isLoading = false;
        this.userService.selectedUser$.next(null);
        if (err.status === 409) {
          this.modalService.showJavascriptError(
            "Es existiert kein Benutzer mit dem Login: " + this.form.value.login
          );
        } else {
          throw err;
        }
      }
    );
  }

  getEmailErrorMessage() {
    const email = this.form.get("email");
    if (email.hasError("required")) {
      return "Es wird eine Email-Adresse benötigt";
    }

    return email.hasError("email") ? "Keine gültige Email-Adresse" : "";
  }

  getRoleIcon(role: string) {
    switch (true) {
      case role === "ige-super-admin":
      case role === "cat-admin":
        return "catalog-admin";
      case role?.includes("admin"):
        return "meta-admin";
      default:
        return "author";
    }
  }

  enableForm() {
    this.form.enable();
    this.form.get("login")?.disable();
  }

  private updateUserForm(user: FrontendUser) {
    const mergedUser = {
      ...{
        email: "",
        groups: [],
        role: "Keiner Rolle zugeordnet",
        ...user,
      },
    };
    this.enableForm();
    this.form.reset(mergedUser);
    this.isLoading = false;
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
        this.dialog
          .open(EditManagerDialogComponent, {
            data: { user: this.selectedUser },
            hasBackdrop: true,
          })
          .afterClosed()
          .subscribe((result) => {
            if (result) {
              this.saveUser(result);
              this.userService.selectedUser$.next(result);
            }
          });
      }
    });
  }
}
