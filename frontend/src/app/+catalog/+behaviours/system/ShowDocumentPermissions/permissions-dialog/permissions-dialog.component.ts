import { Component, Inject, OnInit } from "@angular/core";
import { DocumentService } from "../../../../../services/document/document.service";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import {
  PermissionLevel,
  User,
  UserWithDocPermission,
} from "../../../../../+user/user";
import { FormControl } from "@angular/forms";
import { UserTableComponent } from "../../../../../+user/user/user-table/user-table.component";
import { CdkDrag, CdkDragHandle } from "@angular/cdk/drag-drop";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { SharedModule } from "../../../../../shared/shared.module";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { NgIf } from "@angular/common";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ConfigService } from "../../../../../services/config/config.service";
import { ConfirmDialogComponent } from "../../../../../dialogs/confirm/confirm-dialog.component";

export interface PermissionDialogData {
  id: number;
  forResponsibility: boolean;
}

@Component({
  selector: "ige-access-dialog",
  templateUrl: "./permissions-dialog.component.html",
  styleUrls: ["./permissions-dialog.component.scss"],
  imports: [
    UserTableComponent,
    CdkDrag,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    SharedModule,
    MatProgressSpinnerModule,
    CdkDragHandle,
    NgIf,
  ],
  standalone: true,
})
export class PermissionsDialogComponent implements OnInit {
  id: number;
  // TODO: configure dialog through data, like submit-button - label
  // TODO: also the filtering of the user READ/WRITE to prevent specific logic in component
  forResponsibility = false;
  selectedUser: User;
  users: UserWithDocPermission[];
  query = new FormControl<string>("");

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PermissionDialogData,
    private documentService: DocumentService,
    private dialogRef: MatDialogRef<PermissionsDialogComponent>,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    public configService: ConfigService,
  ) {
    this.id = data.id;
    this.forResponsibility = data.forResponsibility;
  }

  ngOnInit() {
    this.loadPermissionById(this.id);
  }

  closeWithSelectedUser() {
    this.dialogRef.close(this.selectedUser);
  }

  private loadPermissionById(id: number) {
    this.documentService
      .getUsersWithPermission(id)
      .subscribe((response) => this.buildTableData(response));
  }

  // TODO: this should be controlled by the dialog data!
  private buildTableData(response: any) {
    this.users = [
      ...this.createUsersWithPermission(
        response.canWrite,
        PermissionLevel.WRITE,
      ),
    ];
    // Only add readonly users if the dialog is not for responsibility
    if (!this.forResponsibility) {
      this.users.push(
        ...this.createUsersWithPermission(
          response.canOnlyRead,
          PermissionLevel.READ,
        ),
      );
    }
  }

  private createUsersWithPermission(
    users: User[],
    permission: PermissionLevel,
  ): UserWithDocPermission[] {
    return users.map((user) => new UserWithDocPermission(user, permission));
  }

  // TODO: this action should be done by the component which called the dialog!
  setAsResponsible() {
    this.documentService
      .setResponsibleUser(this.id, this.selectedUser.id)
      .subscribe(() => {
        this.snackBar.open("Verantwortlicher aktualisiert.");
        this.closeWithSelectedUser();
      });
  }

  handleShowSelectedUser() {
    if (this.selectedUser?.id === this.configService.$userInfo?.getValue().id) {
      return this.showSelfSelectWarnDialog();
    }
    this.closeWithSelectedUser();
  }

  public showSelfSelectWarnDialog() {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: "Achtung",
        message: `Sie können nur andere Benutzer verwalten.`,
      },
      maxWidth: "520px",
    });
  }
}
