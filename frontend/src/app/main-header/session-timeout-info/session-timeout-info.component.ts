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
import { Component, Input, OnInit } from "@angular/core";
import { AuthenticationFactory } from "../../security/auth.factory";
import { A11yModule } from "@angular/cdk/a11y";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatIconModule } from "@angular/material/icon";

import { TimePipe } from "../../directives/time.pipe";

@Component({
  selector: "ige-session-timeout-info",
  templateUrl: "./session-timeout-info.component.html",
  styleUrls: ["./session-timeout-info.component.scss"],
  standalone: true,
  imports: [
    A11yModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    TimePipe,
  ],
})
export class SessionTimeoutInfoComponent implements OnInit {
  @Input() timeout: number;
  @Input() autoHide: boolean = true;

  constructor(private authFactory: AuthenticationFactory) {}

  ngOnInit(): void {}

  refreshSession() {
    this.authFactory.get().refreshToken();
  }
}
