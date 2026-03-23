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
import { Component } from "@angular/core";
import { NgxFlowModule } from "@flowjs/ngx-flow";
import { OpenDataComponent } from "./profile-opendata";

@Component({
  template: "",
  standalone: true,
  imports: [NgxFlowModule],
})
class BmiComponent extends OpenDataComponent {
  constructor() {
    super();
    this.reportsService.setFilter((route) => route.path != "url-check");
    this.opendata.options.spatialTypes = ["free", "wkt"];
    this.opendata.options.temporalLegacy = true;
  }
}

export class ProfilePack {
  static getMyComponent() {
    return BmiComponent;
  }
}
