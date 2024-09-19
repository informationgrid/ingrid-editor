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
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

import { UserDataService } from "../../../services/user/user-data.service";
import { catchError } from "rxjs/operators";
import { IgeError } from "../../../models/ige-error";
import { SearchInputComponent } from "../../../shared/search-input/search-input.component";

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
    MatProgressSpinnerModule,
    CdkDragHandle,
    SearchInputComponent,
  ],
  standalone: true,
})
export class TransferResponsibilityDialogComponent implements OnInit {
  oldUser: User;
  selectedUser: User;
  users: User[];
  query = new FormControl<string>("");

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<TransferResponsibilityDialogComponent>,
    private userService: UserDataService,
  ) {
    this.oldUser = data.oldUser;
    this.users = data.users;
  }

  ngOnInit() {}

  transferResponsibility() {
    console.debug(
      `von ${this.oldUser.login} zu ${this.selectedUser.login} wechseln`,
    );
    this.userService
      .transferResponsibility(this.oldUser.id, this.selectedUser.id)
      .pipe(
        catchError((err) => {
          const httpError = err.error;
          if (httpError.errorCode === "TRANSFER_RESPONSIBILITY_EXCEPTION") {
            const igeError = new IgeError(
              `Der Nutzer ${this.selectedUser.login} kann Verantwortung nicht übernehmen, da er keine ausreichenden Berechtigungen auf folgende Datensätze hat:`,
            );
            igeError.items = httpError.data.docIds;
            throw igeError;
          } else {
            throw err;
          }
        }),
      )
      .subscribe(() => {
        this.dialogRef.close(this.selectedUser.id);
      });
  }
}
