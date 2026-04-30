/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { ActivatedRoute } from "@angular/router";
import { ConfigService } from "../services/config/config.service";

@Component({
  selector: "ige-session-expired",
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  template: `
    <div class="session-expired-wrapper">
      <mat-card>
        <h2>Sitzung abgelaufen</h2>
        <p>Ihre Sitzung ist abgelaufen oder Sie sind nicht angemeldet.</p>
        <div class="actions">
          <button mat-raised-button color="primary" (click)="login()">
            Anmelden
          </button>
        </div>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .session-expired-wrapper {
        display: flex;
        min-height: 60vh;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }
      mat-card {
        max-width: 520px;
        width: 100%;
      }
      .actions {
        margin-top: 16px;
        display: flex;
        justify-content: flex-end;
      }
    `,
  ],
})
export class SessionExpiredComponent {
  private configService = inject(ConfigService);

  login() {
    // Simply go to server-side login; after successful login, the app will init and route appropriately
    window.location.href =
      this.configService.getConfiguration().contextPath + "auth/login";
  }
}
