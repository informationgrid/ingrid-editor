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
import {
  FormControl,
  UntypedFormBuilder,
  UntypedFormGroup,
} from "@angular/forms";
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
import { MatSnackBar } from "@angular/material/snack-bar";
import { EventService, IgeEvent } from "../../services/event/event.service";
import {
  FormMenuService,
  FormularMenuItem,
} from "../../+form/form-menu.service";

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
  form = new UntypedFormGroup({});
  menuItems: FormularMenuItem[];

  selectedUser: User;
  showMore = false;
  isLoading = false;
  formlyFieldConfig: FormlyFieldConfig[];
  model: User;
  tableWidth: number;
  selectedUserRole: string;
  query = new FormControl<string>("");

  constructor(
    private fb: UntypedFormBuilder,
    private dialog: MatDialog,
    public userService: UserService,
    private groupService: GroupService,
    private groupQuery: GroupQuery,
    private configService: ConfigService,
    private eventService: EventService,
    private router: Router,
    public userManagementService: UserManagementService,
    private formMenuService: FormMenuService,
    private session: SessionQuery,
    private toast: MatSnackBar,
    private cdRef: ChangeDetectorRef
  ) {
    this.model = new FrontendUser();
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
      this.router.navigate([`${ConfigService.catalogId}/manage/group`]);

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
    this.menuItems = this.formMenuService.getMenuItems("user");
    this.userService.users$
      .pipe(untilDestroyed(this))
      .subscribe((users) => (this.users = users));
    this.userService.getUsers().subscribe(() => {
      // select group after groups are fetched, otherwise table has no data
      // to select from
      this.userService.selectedUser$
        .pipe(
          tap((user) => {
            if (user == null) this.selectedUser = null;
          }),
          filter((user) => !!user),
          tap((user) => {
            const previousId = this.selectedUser?.login;
            this.selectedUser = user;
            if (user && previousId !== user.login) {
              this.loadUser(user.id);
            }
            this.selectedUserRole = user.role;
          }),
          untilDestroyed(this)
        )
        .subscribe();
    });

    // load previously selected user
    if (this.userService.selectedUser$.value) {
      this.loadUser(this.userService.selectedUser$.value.id);
    }
  }

  loadUser(id: number) {
    this.dirtyFormHandled().subscribe((confirmed) => {
      if (confirmed) {
        this.showLoading();
        this.userService
          .getUser(id)
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
          .subscribe((result) => {
            if (result?.id) this.updateUsersAndLoad(result.id);
          });
    });
  }

  private updateUsersAndLoad(userId: number) {
    this.userService.getUsers().subscribe(() => this.loadUser(userId));
  }

  deleteUser(user: User) {
    this.eventService
      .sendEventAndContinueOnSuccess(IgeEvent.DELETE_USER, user)
      .subscribe(() => this.openDeleteUserDialog(user));
  }

  private openDeleteUserDialog(user: User) {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: "Benutzer löschen",
          message: `Möchten Sie den Benutzer "${user.login}" wirklich löschen?`,
        } as ConfirmDialogData,
      })
      .afterClosed()
      .pipe(
        filter((result) => result),
        switchMap(() => this.userService.deleteUser(user.id))
      )
      .subscribe(() => {
        this.userService.selectedUser$.next(null);
        this.selectedUser = null;
        this.userService.fetchUsers();
      });
  }

  saveUser(user?: User, loadUser: boolean = true): void {
    this.showLoading();

    user = user ?? this.model;
    // send request and handle error
    this.userService
      .updateUser(user)
      .pipe(finalize(() => this.hideLoading()))
      .subscribe(() => {
        if (loadUser) {
          this.form.markAsPristine();
          this.updateUsersAndLoad(user.id);
          this.toast.open("Benutzer wurde gespeichert", "", {
            panelClass: "green",
          });
        }
      });
  }

  discardUser(user?: User): void {
    this.showLoading();

    user = user ?? this.model;

    this.form.markAsPristine();
    this.updateUsersAndLoad(user.id);
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
            title: "Änderungen speichern?",
            message:
              "Es wurden Änderungen am ausgewählten Benutzer vorgenommen.\nMöchten Sie die Änderungen speichern?",
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
          map((response) => response === "discard" || response === "save")
        );
    }

    return of(true);
  }

  private async handleAction(action: undefined | "save" | "discard") {
    if (action === "save") {
      const user = this.model;
      this.saveUser(user, false);
    } else if (action === "discard") {
      const user = this.form.value;
      this.form.reset(user);
    } else {
      // do nothing
    }
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
