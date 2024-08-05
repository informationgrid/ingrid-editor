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
import { FormlyFieldConfig } from "@ngx-formly/core";

import {
  AfterViewInit,
  Component,
  effect,
  OnInit,
  signal,
} from "@angular/core";
import { UserService } from "../../services/user/user.service";
import { User } from "../user";
import { Observable, of } from "rxjs";
import { UntilDestroy } from "@ngneat/until-destroy";
import { GroupService } from "../../services/role/group.service";
import { FormControl, UntypedFormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { NewUserDialogComponent } from "./new-user-dialog/new-user-dialog.component";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../dialogs/confirm/confirm-dialog.component";
import { finalize, map, tap } from "rxjs/operators";
import { UserManagementService } from "../user-management.service";
import { SessionQuery } from "../../store/session.query";
import { ConfigService } from "../../services/config/config.service";
import { Router } from "@angular/router";
import { GroupQuery } from "../../store/group/group.query";
import { MatSnackBar } from "@angular/material/snack-bar";
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
export class UserComponent implements OnInit, AfterViewInit {
  users = this.userService.users$;
  form = new UntypedFormGroup({});
  menuItems: FormularMenuItem[];

  selectedUser = this.userService.selectedUser$;
  explicitUser = signal<User>(null);
  loadedUser = signal<User>(null);
  showMore = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  formlyFieldConfig: FormlyFieldConfig[];
  tableWidth: number;
  query = new FormControl<string>("");
  private previousSelectedUser: User = null;

  constructor(
    private dialog: MatDialog,
    public userService: UserService,
    private groupService: GroupService,
    private groupQuery: GroupQuery,
    private router: Router,
    public userManagementService: UserManagementService,
    private formMenuService: FormMenuService,
    private session: SessionQuery,
    private snackBar: MatSnackBar,
  ) {
    this.groupQuery.selectAll().subscribe((groups) => {
      this.formlyFieldConfig = this.userService.getUserFormFields(
        groups,
        this.groupSelectCallback,
        this.roleChangeCallback,
      );
    });
    this.tableWidth = this.session.getValue().ui.userTableWidth;

    effect(
      () => {
        const user = this.userService.selectedUser$();
        // set user in case we come from another page
        // TODO: should be done with URL-parameter to load the user like it's done on document page
        this.explicitUser.set(user);
        if (user && this.loadedUser()?.id !== user.id) this.loadUser(user.id);
      },
      { allowSignalWrites: true },
    );
  }

  ngAfterViewInit(): void {
    this.tableWidth = this.session.getValue().ui.userTableWidth;
  }

  ngOnInit() {
    this.menuItems = this.formMenuService.getMenuItems("user");
    this.updateUsers();
  }

  groupSelectCallback = (groupIdString: string) => {
    const groupId = +groupIdString;
    const doReload = this.groupQuery.getActiveId() === groupId;
    this.groupService.getGroup(groupId).subscribe(() => {
      this.groupService.setActive(groupId);
      this.router.navigate([`${ConfigService.catalogId}/manage/group`]);

      if (doReload) this.groupService.forceReload$.next();
    });
  };

  roleChangeCallback = () => {
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

  loadUser(id: number) {
    this.dirtyFormHandled().subscribe((confirmed) => {
      if (confirmed) {
        this.showLoading();
        this.previousSelectedUser = this.selectedUser();
        this.userService
          .getUser(id)
          .pipe(
            tap((value) => this.form.patchValue(value)),
            tap((value) => this.loadedUser.set(value)),
            finalize(() => this.hideLoading()),
          )
          .subscribe();
      } else {
        this.explicitUser.set(this.previousSelectedUser);
      }
    });
  }

  showAddUsersDialog() {
    this.dirtyFormHandled().subscribe((allClear) => {
      if (allClear)
        this.dialog
          .open(NewUserDialogComponent, {
            hasBackdrop: true,
            disableClose: true,
          })
          .afterClosed()
          .subscribe((result) => {
            if (result?.id) {
              this.updateUsers();
              this.userService.selectedUser$.set(result);
            }
          });
    });
  }

  private updateUsers() {
    this.userService.getUsers().subscribe();
  }

  saveUser(user?: User, loadUser: boolean = true): void {
    this.showLoading();

    user = user ?? this.form.value;
    // send request and handle error
    this.userService
      .updateUser(user)
      .pipe(finalize(() => this.hideLoading()))
      .subscribe(() => {
        if (loadUser) {
          // this.model.set(user);
          this.form.markAsPristine();
          // this.updateUsersAndLoad(user.id);
          this.snackBar.open("Benutzer wurde gespeichert", "", {
            panelClass: "green",
          });
        }
      });
  }

  discardUser(): void {
    this.showLoading();
    this.form.markAsPristine();
    this.updateUsers();
    this.form.reset();
  }

  enableForm() {
    this.form.enable();
    this.form.get("login")?.disable();
  }

  dirtyFormHandled(): Observable<boolean> {
    if (this.form.dirty) {
      return this.dialog
        .open(ConfirmDialogComponent, {
          data: (<ConfirmDialogData>{
            title: this.form?.invalid
              ? "Änderungen Verwerfen?"
              : "Änderungen speichern?",
            message:
              "Es wurden Änderungen am ausgewählten Benutzer vorgenommen. " +
              (this.form?.invalid
                ? ""
                : "\nMöchten Sie die Änderungen speichern?"),
            buttons: [
              { text: "Abbrechen" },
              {
                text: "Verwerfen",
                id: "discard",
                alignRight: true,
                emphasize: false,
              },
            ].concat(
              this.form?.invalid
                ? []
                : [
                    {
                      text: "Speichern",
                      id: "save",
                      alignRight: true,
                      emphasize: true,
                    },
                  ],
            ),
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
    const user = this.form.value;
    if (action === "save") {
      this.saveUser(user, false);
    } else if (action === "discard") {
      this.form.reset(user);
    } else {
      // do nothing
    }
  }

  private showLoading() {
    this.isLoading.set(true);
    this.form.disable();
  }

  private hideLoading() {
    this.enableForm();
    this.isLoading.set(false);
  }

  handleUserSelect($event: User) {
    this.selectedUser.set($event);
  }
}
