import { Component, Inject, OnInit } from "@angular/core";
import { DocumentService } from "../../../../../services/document/document.service";
import {
  MAT_DIALOG_DATA,
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
  users: UserWithDocPermission[];
  query = new FormControl<string>("");

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private documentService: DocumentService,
    private dialogRef: MatDialogRef<PermissionsDialogComponent>
  ) {
    this.id = data.id;
  }

  ngOnInit() {
    this.loadPermissionById(this.id);
  }

  switchToUser($event: User) {
    this.dialogRef.close($event);
  }

  private loadPermissionById(id: number) {
    this.documentService
      .getUsersWithPermission(id)
      .subscribe((response) => this.buildTableData(response));
  }

  private buildTableData(response: any) {
    this.users = [
      ...this.createUsersWithPermission(
        response.canOnlyRead,
        PermissionLevel.READ
      ),
      ...this.createUsersWithPermission(
        response.canWrite,
        PermissionLevel.WRITE
      ),
    ];
  }

  private createUsersWithPermission(
    users: User[],
    permission: PermissionLevel
  ): UserWithDocPermission[] {
    const output = [];
    for (const user of users) {
      const createdUser = new UserWithDocPermission(user, permission);
      output.push(createdUser);
    }
    return output;
  }
}
