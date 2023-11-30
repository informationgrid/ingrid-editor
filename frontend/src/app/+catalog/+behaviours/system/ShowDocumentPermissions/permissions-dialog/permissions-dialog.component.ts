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
  forResponsibility = false;
  selectedUser: User;
  users: UserWithDocPermission[];
  query = new FormControl<string>("");

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
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

  switchToUser() {
    this.dialogRef.close(this.selectedUser);
  }

  private loadPermissionById(id: number) {
    this.documentService
      .getUsersWithPermission(id)
      .subscribe((response) => this.buildTableData(response));
  }

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

  setAsResponsible() {
    this.documentService
      .setResponsibleUser(this.id, this.selectedUser.id)
      .subscribe(() => {
        this.snackBar.open("Verantwortlicher aktualisiert.");
        this.dialogRef.close();
      });
  }

  onButtonClick() {
    if (this.selectedUser?.id === this.configService.$userInfo?.getValue().id) {
      this.showSelfSelectWarnDialog();
    } else {
      this.switchToUser();
    }
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
