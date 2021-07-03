import { FormlyFieldConfig } from "@ngx-formly/core";

import {
  AfterContentChecked,
  ChangeDetectorRef,
  Component,
  OnInit,
} from "@angular/core";
import { ModalService } from "../../services/modal/modal.service";
import { UserService } from "../../services/user/user.service";
import { FrontendUser, User } from "../user";
import { Observable, of } from "rxjs";
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

@UntilDestroy()
@Component({
  selector: "ige-user-manager",
  templateUrl: "./user.component.html",
  styleUrls: ["../user.styles.scss"],
})
export class UserComponent implements OnInit, AfterContentChecked {
  users: User[];
  admins: User[];
  ADMIN_ROLES = ["cat-admin", "md-admin", "admin", "ige-super-admin"];
  currentTab: string;
  form = new FormGroup({});

  isNewUser = false;
  roles = this.userService.availableRoles;
  groups = this.groupService.getGroups();
  selectedUserForm = new FormControl();
  selectedUser: User;
  showMore = false;
  searchQuery: string;
  isLoading = false;
  formlyFieldConfig: FormlyFieldConfig[];
  model: User;
  private isNewExternalUser = false;

  constructor(
    private modalService: ModalService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private userService: UserService,
    private groupService: GroupService,
    private cdRef: ChangeDetectorRef
  ) {
    this.model = new FrontendUser();
    this.searchQuery = "";
    this.formlyFieldConfig = this.userService.getUserFormFields();
  }

  ngAfterContentChecked(): void {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.currentTab = "users";

    this.fetchUsers();
  }

  fetchUsers() {
    const currentValue = this.selectedUserForm.value;

    this.userService
      .getUsers()
      // .pipe(tap(users => users.filter(u => u.login === this.selectedUser.value.login)))
      .pipe(
        map((users: FrontendUser[]) =>
          users.sort((a, b) => a.login.localeCompare(b.login))
        ),
        tap((users) => (this.users = users ? users : [])),
        tap(
          () =>
            (this.admins = this.users.filter((u) =>
              u.role ? this.ADMIN_ROLES.includes(u.role) : false
            ))
        ),
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
        this.isNewUser = false;
        this.form.disable();
        this.userService.getUser(login).subscribe((user) => {
          this.selectedUser = user;
          this.model = user;
          this.updateUserForm(user);
        });
      }
    });
  }

  showAddUsersDialog(importExternal: boolean) {
    this.dialog
      .open(NewUserDialogComponent, {
        data: { importExternal: importExternal },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.isNewExternalUser = !importExternal;
          this.addUser(result);
        }
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
            this.selectedUser = null;
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
    if (this.isNewUser) {
      createUserObserver = this.userService.createUser(
        user,
        this.isNewExternalUser
      );
    } else {
      createUserObserver = this.userService.updateUser(user);
    }

    // send request and handle error
    createUserObserver.subscribe(
      () => {
        this.isNewUser = false;
        this.fetchUsers();
        this.enableForm();
        this.form.markAsPristine();
        this.loadUser(user.login);
      },
      (err: any) => {
        this.enableForm();
        this.isLoading = false;
        this.selectedUser = null;
        if (err.status === 409) {
          if (this.isNewUser) {
            const errorText: string = err.error.errorText;
            if (errorText.includes("User already Exists with login")) {
              const login = errorText.split(" ").pop();
              this.modalService.showJavascriptError(
                "Es existiert bereits ein Benutzer mit dem Login: " + login
              );
            } else if (
              errorText.includes(
                "New user cannot be created, because another user might have the same email address"
              )
            ) {
              this.modalService.showJavascriptError(
                "Es existiert bereits ein Benutzer mit dieser Mailadresse"
              );
            } else {
              throw err;
            }
          } else {
            this.modalService.showJavascriptError(
              "Es existiert kein Benutzer mit dem Login: " +
                this.form.value.login
            );
          }
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

  private addUser(initial: any) {
    this.isLoading = true;
    const newUser: User = initial.user ?? initial;
    newUser.role = initial.role ?? "";
    this.isNewUser = true;
    this.form.reset(newUser);
    this.saveUser(newUser);
  }

  private dirtyFormHandled(): Observable<boolean> {
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
        })
        .afterClosed()
        .pipe(map((response) => response === "discard"));
    }

    return of(true);
  }
}
