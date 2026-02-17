/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import { Component, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarAction,
  MatSnackBarRef,
} from "@angular/material/snack-bar";
import { SnackBarMessageService } from "./snackbar-message.service";

/**
 * This component is a lasting, updatable snackbar.
 * It relies on a custom SnackBarMessageService that is injected via a token.
 */
@Component({
  selector: "app-updatable-mat-snack-bar",
  standalone: true,
  imports: [MatButtonModule, MatSnackBarAction],
  template: `
    <span [innerHTML]="service.message()"></span>
    <button
      mat-button
      matSnackBarAction
      (click)="snackBarRef.dismissWithAction()"
    >
      Ausblenden
    </button>
  `,
  styles: [
    `
      :host {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        gap: 16px;
      }
    `,
  ],
})
export class UpdatableMatSnackBar {
  public service = inject<SnackBarMessageService>(MAT_SNACK_BAR_DATA);
  public snackBarRef = inject(MatSnackBarRef<UpdatableMatSnackBar>);
}
