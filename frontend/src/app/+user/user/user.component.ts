import { FormlyFieldConfig } from "@ngx-formly/core";

import {
  AfterContentChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
} from "@angular/core";
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
import { filter, finalize, map, switchMap, tap } from "rxjs/operators";
import { UserManagementService } from "../user-management.service";
import { SessionQuery } from "../../store/session.query";
import { ConfigService } from "../../services/config/config.service";
import { Router } from "@angular/router";
import { GroupQuery } from "../../store/group/group.query";

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
    private fb: FormBuilder,
    private dialog: MatDialog,
    public userService: UserService,
    private groupService: GroupService,
    private groupQuery: GroupQuery,
    private configService: ConfigService,
    private router: Router,
    public userManagementService: UserManagementService,
    private session: SessionQuery,
    private cdRef: ChangeDetectorRef
  ) {
    this.model = new FrontendUser();
    this.searchQuery = "";
    this.groupQuery.selectAll().subscribe((groups) => {
      this.formlyFieldConfig = this.userService.getUserFormFields(
        groups,
        this.groupSelectCallback,
        this.roleChangeCallback
      );
    });
    this.tableWidth = this.session.getValue().ui.userTableWidth;
  }

  groupSelectCallback = (groupIdString: string) => {
    const groupId = +groupIdString;
    const doReload = this.groupQuery.getActiveId() === groupId;
    this.groupService.getGroup(groupId).subscribe((group) => {
      this.groupService.setActive(groupId);
      this.router.navigate(["/manage/group"]);

      if (doReload) this.groupService.forceReload$.next();
    });
  };

  roleChangeCallback = (field, $event) => {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: "Rolle ändern",
        message: "Hinweis: Die Änderung der Rolle ist katalogübergreifend",
        buttons: [
          {
            text: "Ok",
            alignRight: true,
            emphasize: true,
          },
        ],
      } as ConfirmDialogData,
    });
  };

  ngAfterViewInit(): void {
    this.tableWidth = this.session.getValue().ui.userTableWidth;
  }

  ngAfterContentChecked(): void {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.fetchUsers().subscribe(() => {
      // select group after groups are fetched, otherwise table has no data
      // to select from
      this.userService.selectedUser$
        .pipe(
          filter((user) => !!user),
          tap((user) => {
            const previousId = this.selectedUser?.login;
            this.selectedUser = user;
            if (user && previousId !== user.login) {
              this.loadUser(user.login);
            }
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
        this.showLoading();
        this.userService
          .getUser(login)
          .pipe(finalize(() => this.hideLoading()))
          .subscribe((user) => {
            this.selectedUser = user;
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
          .subscribe((result) => this.updateUsersAndLoad(result));
    });
  }

  private updateUsersAndLoad(result) {
    if (result) {
      this.fetchUsers().subscribe(() => this.loadUser(result.login));
    } else {
      this.fetchUsers().subscribe();
    }
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
      .pipe(
        filter((result) => result),
        switchMap(() => this.userService.deleteUser(login))
      )
      .subscribe(() => {
        this.userService.selectedUser$.next(null);
        this.selectedUser = null;
        this.fetchUsers().subscribe();
      });
  }

  saveUser(user?: User): void {
    this.showLoading();

    user = user ?? this.model;

    // send request and handle error
    this.userService.updateUser(user).subscribe(
      () => {
        this.fetchUsers().subscribe();
        this.form.markAsPristine();
        this.loadUser(user.login);
      },
      (err: any) => {
        this.hideLoading();
        this.userService.selectedUser$.next(null);
        throw err;
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

  enableForm() {
    this.form.enable();
    this.form.get("login")?.disable();
  }

  private updateUserForm(user: FrontendUser) {
    const mergedUser = {
      email: "",
      groups: [],
      role: "Keiner Rolle zugeordnet",
      ...user,
    };
    this.form.reset(mergedUser);
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

  private showLoading() {
    this.isLoading = true;
    this.form.disable();
  }

  private hideLoading() {
    this.enableForm();
    this.isLoading = false;
  }
}
