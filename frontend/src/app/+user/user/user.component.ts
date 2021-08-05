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
import { Observable, of, Subject } from "rxjs";
import { UntilDestroy } from "@ngneat/until-destroy";
import { GroupService } from "../../services/role/group.service";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { NewUserDialogComponent } from "./new-user-dialog/new-user-dialog.component";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../dialogs/confirm/confirm-dialog.component";
import { map, tap } from "rxjs/operators";
import { UserManagementService } from "../user-management.service";
import { SessionQuery } from "../../store/session.query";
import { MatSnackBar } from "@angular/material/snack-bar";
import { EditManagerDialogComponent } from "./edit-manager-dialog/edit-manager-dialog.component";
import { ConfigService } from "../../services/config/config.service";

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

  roles = this.userService.availableRoles;
  groups = this.groupService.getGroups();
  selectedUserForm = new FormControl();
  selectedUser: User;
  selectedUser$: Subject<User>;
  showMore = false;
  searchQuery: string;
  isLoading = false;
  formlyFieldConfig: FormlyFieldConfig[];
  model: User;
  tableWidth: number;

  constructor(
    private modalService: ModalService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private userService: UserService,
    private groupService: GroupService,
    private configService: ConfigService,
    public userManagementService: UserManagementService,
    private session: SessionQuery,
    private snackBar: MatSnackBar,
    private cdRef: ChangeDetectorRef
  ) {
    this.model = new FrontendUser();
    this.searchQuery = "";
    this.formlyFieldConfig = this.userService.getUserFormFields();
    this.tableWidth = this.session.getValue().ui.userTableWidth;
    this.selectedUser$ = new Subject<User>();
  }

  ngAfterViewInit(): void {
    this.tableWidth = this.session.getValue().ui.userTableWidth;
  }

  ngAfterContentChecked(): void {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.currentTab = "users";

    this.fetchUsers();
    this.selectedUser$
      .pipe(tap((user) => (this.selectedUser = user)))
      .subscribe();
  }

  fetchUsers() {
    const currentValue = this.selectedUserForm.value;
    this.userService
      .getUsers()
      .pipe(
        map((users: FrontendUser[]) =>
          users
            .filter(
              // remove current user from list
              (u) => u.login !== this.configService.$userInfo.getValue().userId
            )
            .sort((a, b) => a.login.localeCompare(b.login))
        ),
        tap((users) => (this.users = users ? users : [])),
        tap(() =>
          setTimeout(() => this.selectedUserForm.setValue(currentValue))
        )
      )
      .subscribe();
  }

  loadUser(login: string) {
    this.dirtyFormHandled().subscribe((confirmed) => {
      if (confirmed) {
        this.isLoading = true;
        this.form.disable();
        this.userService.getUser(login).subscribe((user) => {
          this.selectedUser$.next(user);
          this.model = user;
          this.updateUserForm(user);
        });
      } else {
        this.selectedUser$.next(this.selectedUser);
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
              this.fetchUsers();
              this.loadUser(result.login);
              this.snackBar.open("Registrierungs-E-Mail wurde versandt", "", {
                panelClass: "green",
              });
            }
          });
    });
  }

  deleteUser(login: string) {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: "Benutzer löschen",
          message: "Möchten Sie den Benutzer " + login + " wirklich löschen?",
        } as ConfirmDialogData,
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.userService.deleteUser(login).subscribe(() => {
            this.selectedUser$.next(null);
            this.fetchUsers();
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
        this.fetchUsers();
        this.enableForm();
        this.form.markAsPristine();
        this.loadUser(user.login);
      },
      (err: any) => {
        this.enableForm();
        this.isLoading = false;
        this.selectedUser$.next(null);
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
    this.form.get("role")?.disable();
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
              this.selectedUser$.next(result);
            }
          });
      }
    });
  }
}
