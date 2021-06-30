import { Component, OnInit } from "@angular/core";
import { ModalService } from "../../services/modal/modal.service";
import { GroupService } from "../../services/role/group.service";
import { Group } from "../../models/user-group";
import { Observable } from "rxjs";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
} from "@angular/forms";
import { Permissions, User } from "../user";
import { tap } from "rxjs/operators";
import { UntilDestroy } from "@ngneat/until-destroy";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../dialogs/confirm/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";

@UntilDestroy()
@Component({
  selector: "ige-group-manager",
  templateUrl: "./group.component.html",
  styleUrls: ["../user.styles.scss"],
})
export class GroupComponent implements OnInit {
  groups: Group[] = [];
  searchQuery: string;

  isNewGroup = false;
  form: FormGroup;

  initialValue = {
    id: null,
    name: "",
    description: "",
    permissions: new Permissions(),
  };
  selectedGroupForm = new FormControl();
  selectedGroup: Group;
  isLoading = false;
  showMore = false;

  constructor(
    private modalService: ModalService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private groupService: GroupService
  ) {
    this.searchQuery = "";
  }

  ngOnInit() {
    this.fetchGroups().subscribe();

    this.form = this.fb.group({
      id: [],
      name: ["", this.forbiddenNameValidator()],
      description: [],
      permissions: [],
    });
  }

  fetchGroups(): Observable<Group[]> {
    const currentValue = this.selectedGroupForm.value;

    return this.groupService.getGroups().pipe(
      tap((groups) => (this.groups = groups)),
      tap(() => setTimeout(() => this.selectedGroupForm.setValue(currentValue)))
    );
  }

  addGroup() {
    this.isNewGroup = true;
    this.form.setValue(this.initialValue);
  }

  loadGroup(id: string) {
    this.isLoading = true;
    this.isNewGroup = false;
    this.form.disable();
    this.groupService.getGroup(id).subscribe((fetchedGroup) => {
      if (!fetchedGroup.permissions) {
        fetchedGroup.permissions = new Permissions();
      }
      this.form.reset(fetchedGroup);
      this.form.enable();
      this.isLoading = false;
    });
  }

  saveGroup() {
    let observer: Observable<Group>;
    const group = this.form.value;

    if (this.isNewGroup) {
      observer = this.groupService.createGroup(group);
    } else {
      observer = this.groupService.updateGroup(group);
    }

    // send request and handle error
    observer.subscribe(
      () => {
        this.isNewGroup = false;
        this.fetchGroups()
          .pipe(tap(() => this.form.markAsPristine()))
          .subscribe();
      },
      (err: any) => {
        if (err.status === 406) {
          if (this.isNewGroup) {
            this.modalService.showJavascriptError(
              "Es existiert bereits ein Benutzer mit dem Login: " +
                this.form.get("name")
            );
          } else {
            this.modalService.showJavascriptError(
              "Es existiert kein Benutzer mit dem Login: " +
                this.form.get("name")
            );
          }
        } else {
          throw err;
        }
      }
    );
  }

  async deleteGroup(id: string) {
    this.groupService.getUsersOfGroup(id).subscribe((users) => {
      const data = this.createDeleteDialogData(users);

      this.dialog
        .open(ConfirmDialogComponent, {
          data: data,
        })
        .afterClosed()
        .subscribe((result) => {
          if (result) {
            this.groupService.deleteGroup(id).subscribe(() => {
              this.fetchGroups()
                .pipe(tap(() => (this.selectedGroup = null)))
                .subscribe();
            });
          }
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

  private createDeleteDialogData(users: User[]): ConfirmDialogData {
    return {
      title: "Gruppe löschen",
      message:
        users.length > 0
          ? `Möchten Sie die Gruppe wirklich löschen? Die Gruppe wird von ${users.length} Nutzer(n) verwendet:`
          : "Möchten Sie die Gruppe wirklich löschen?",
      list: users.map((user) => user.login),
    };
  }
}
