import { Component, Inject, OnInit } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { User } from "../../user";
import { FormControl } from "@angular/forms";
import { UserTableComponent } from "../user-table/user-table.component";
import { CdkDrag, CdkDragHandle } from "@angular/cdk/drag-drop";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { SharedModule } from "../../../shared/shared.module";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { NgIf } from "@angular/common";
import { UserDataService } from "../../../services/user/user-data.service";
import { catchError } from "rxjs/operators";
import { IgeError } from "../../../models/ige-error";

@Component({
  selector: "ige-transfer-responsibility-dialog",
  templateUrl: "./transfer-responsibility-dialog.component.html",
  styleUrls: ["./transfer-responsibility-dialog.component.scss"],
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
export class TransferResponsibilityDialogComponent implements OnInit {
  oldUser: User;
  selectedUser: User;
  users: User[];
  query = new FormControl<string>("");

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<TransferResponsibilityDialogComponent>,
    private userService: UserDataService
  ) {
    this.oldUser = data.oldUser;
    this.users = data.users;
  }

  ngOnInit() {}

  transferResponsibility() {
    console.log(
      `von ${this.oldUser.login} zu ${this.selectedUser.login} wechseln`
    );
    this.userService
      .transferResponsibility(this.oldUser.id, this.selectedUser.id)
      .pipe(
        catchError((err) => {
          const httpError = err.error;
          if (httpError.errorCode === "TRANSFER_RESPONSIBILITY_EXCEPTION") {
            const igeError = new IgeError(
              `Der Nutzer ${this.selectedUser.login} kann Verantwortung nicht übernehmen, da er keine ausreichenden Berechtigungen auf folgende Datensätze hat:`
            );
            igeError.items = httpError.data.docIds;
            throw igeError;
          } else {
            throw err;
          }
        })
      )
      .subscribe(() => {
        this.dialogRef.close(this.selectedUser.id);
      });
  }
}
