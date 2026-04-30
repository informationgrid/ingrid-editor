/*
 * ==================================================
 * Copyright (C) 2024-2026 wemove digital solutions GmbH
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
import { Component, inject, OnInit } from "@angular/core";
import { ConfigService } from "../services/config/config.service";

@Component({
  template: "",
})
export class LogoutComponent implements OnInit {
  private configService = inject(ConfigService);

  ngOnInit(): void {
    // Trigger backend-initiated logout (also logs out from Keycloak)
    window.location.href =
      this.configService.getConfiguration().contextPath + "auth/logout";
  }
}
