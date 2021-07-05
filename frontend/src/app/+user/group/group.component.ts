import { AfterViewInit, Component, OnInit } from "@angular/core";
import { ModalService } from "../../services/modal/modal.service";
import { GroupService } from "../../services/role/group.service";
import { Group } from "../../models/user-group";
import { Observable, of } from "rxjs";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
} from "@angular/forms";
import { Permissions, User } from "../user";
import { map, tap } from "rxjs/operators";
import { UntilDestroy } from "@ngneat/until-destroy";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../dialogs/confirm/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { NewGroupDialogComponent } from "./new-group-dialog/new-group-dialog.component";
import { Subscription } from "rxjs/Subscription";
import { UserManagementService } from "../user-management.service";
import { SessionQuery } from "../../store/session.query";

@UntilDestroy()
@Component({
  selector: "ige-group-manager",
  templateUrl: "./group.component.html",
  styleUrls: ["../user.styles.scss"],
})
export class GroupComponent implements OnInit, AfterViewInit {
  groups: Group[] = [];
  searchQuery: string;

  isNewGroup = false;
  form: FormGroup;

  selectedGroupForm = new FormControl();
  selectedGroup: Group;
  isLoading = false;
  showMore = false;
  tableWidth: number;

  constructor(
    private modalService: ModalService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private groupService: GroupService,
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

  openAddGroupDialog() {
    this.dialog
      .open(NewGroupDialogComponent)
      .afterClosed()
      .subscribe((result) => {
        if (result?.name) {
          this.addGroup(result.name);
          this.saveGroup();
        }
      });
  }

  addGroup(name: string) {
    this.isNewGroup = true;
    const initialValue = {
      id: null,
      name: name,
      description: "",
      permissions: new Permissions(),
    };
    this.form.setValue(initialValue);
  }

  loadGroup(id: string) {
    this.dirtyFormHandled().subscribe((confirmed) => {
      if (confirmed) {
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
    });
  }

  saveGroup(): Subscription {
    let observer: Observable<Group>;
    const group = this.form.value;

    if (this.isNewGroup) {
      observer = this.groupService.createGroup(group);
    } else {
      observer = this.groupService.updateGroup(group);
    }

    // send request and handle error
    return observer.subscribe((group) => {
      if (group) {
        this.selectedGroup = group;
        this.form.markAsPristine();
        this.loadGroup(group.id);
      }
      this.isNewGroup = false;
      this.fetchGroups()
        .pipe(tap(() => this.form.markAsPristine()))
        .subscribe();
    });
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
          ? `Möchten Sie die Gruppe wirklich löschen? Die Gruppe wird von ${users.length} Nutzer(n) verwendet:`
          : "Möchten Sie die Gruppe wirklich löschen?",
      list: users.map((user) => user.login),
    };
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
