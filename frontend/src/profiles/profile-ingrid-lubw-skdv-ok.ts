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
import { Component, inject, NgModule } from "@angular/core";
import { InGridComponent } from "./profile-ingrid";
import { GeoDatasetDoctypeLubwSkdvOk } from "./ingrid-lubw-skdv-ok/doctypes/geo-dataset.doctype";
import { BehaviourService } from "../app/services/behavior/behaviour.service";
import { ConfigService } from "../app/services/config/config.service";
import { FormMenuService } from "../app/+form/form-menu.service";

@Component({
  template: "",
})
class InGridLubwSkdvOkComponent extends InGridComponent {
  geoDataset = inject(GeoDatasetDoctypeLubwSkdvOk);
  behaviourService = inject(BehaviourService);
  configService = inject(ConfigService);
  formMenuService = inject(FormMenuService);

  constructor() {
    super();
    this.isoView.isoExportFormat = "ingridISOLubwSkdvOk";

    const isAuthor = this.configService.$userInfo.value.role === "author";
    if (isAuthor) {
      this.disablePlugins([
        "plugin.newDoc",
        "plugin.folder",
        "plugin.copy.cut.paste",
        "plugin.deleteDocs",
      ]);
      this.formMenuService.addExcludedMenuItems("publish", [
        "VALIDATE",
        "UNPUBLISH",
        "REVERT",
      ]);
    }
  }

  protected getDocTypes = () => [
    this.folder,
    this.geoDataset,
    this.person,
    this.organisation,
  ];

  private disablePlugins(pluginIds: string[]) {
    pluginIds.forEach((id) => {
      this.behaviourService.getBehaviour(id).isActive = false;
    });
  }
}

@NgModule({
  imports: [InGridLubwSkdvOkComponent],
})
export class ProfilePack {
  static getMyComponent() {
    return InGridLubwSkdvOkComponent;
  }
}
