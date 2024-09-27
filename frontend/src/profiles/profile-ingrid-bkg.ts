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
import { Component, inject, NgModule } from "@angular/core";
import { InGridComponent } from "./profile-ingrid";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { FormFieldHelper } from "./form-field-helper";
import { CommonFieldsBkg } from "./ingrid-bkg/doctypes/common-fields";
import { OpendataBehaviour } from "./ingrid-bkg/behaviours/opendata.behaviour";
import { PluginService } from "../app/services/plugin/plugin.service";
import { BehaviourService } from "../app/services/behavior/behaviour.service";

@Component({
  template: "",
  standalone: true,
})
class InGridBkgComponent extends InGridComponent {
  common = inject(CommonFieldsBkg);
  pluginService = inject(PluginService);
  opendataBehaviour = inject(OpendataBehaviour);
  behaviourService = inject(BehaviourService);

  constructor() {
    super();
    this.isoView.isoExportFormat = "ingridISOBkg";
    this.pluginService.registerPlugin(this.opendataBehaviour);
    this.manipulateFields();
  }

  private manipulateFields() {
    [
      this.specialisedTask,
      this.geoDataset,
      this.publication,
      this.geoService,
      this.project,
      this.dataCollection,
      this.informationSystem,
    ].forEach((docType) => {
      docType.manipulateDocumentFields = (fieldConfig: FormlyFieldConfig[]) => {
        if (docType !== this.specialisedTask) {
          this.addUseAndAccessConstraints(fieldConfig);
          this.removeOriginalUseConstraints(fieldConfig);
        }
        this.removeWktFromSpatialReferences(fieldConfig);

        return fieldConfig;
      };

      if (this.opendataBehaviour.isActive) {
        docType.options.dynamicHide.openDataCategories =
          this.isShowCategoriesActivated() ? "false" : "true";
        docType.options.validate.downloadLinkWhenOpenData = false;
      }
    });
  }

  private isShowCategoriesActivated() {
    return (
      this.behaviourService.getBehaviour("plugin.bkg.opendata")?.data
        ?.showOpenDataCategories ?? false
    );
  }

  private removeWktFromSpatialReferences(fieldConfig: FormlyFieldConfig[]) {
    const spatialRefPosition = FormFieldHelper.findFieldElementWithId(
      fieldConfig,
      "references",
    );
    spatialRefPosition.fieldConfig[spatialRefPosition.index].props.limitTypes =
      ["free", "wfsgnde"];
  }

  private addUseAndAccessConstraints(fieldConfig: FormlyFieldConfig[]) {
    const accessConstraintsPosition = FormFieldHelper.findFieldElementWithId(
      fieldConfig,
      "accessConstraints",
    );
    FormFieldHelper.addAfter(
      accessConstraintsPosition,
      this.common.getUseConstraints(),
    );
    FormFieldHelper.addBefore(
      accessConstraintsPosition,
      this.common.getAccessConstraints(),
    );
  }

  private removeOriginalUseConstraints(fieldConfig: FormlyFieldConfig[]) {
    const useConstraintsPosition = FormFieldHelper.findFieldElementWithId(
      fieldConfig,
      "useConstraints",
    );
    useConstraintsPosition.fieldConfig.splice(useConstraintsPosition.index, 1);
  }
}

@NgModule({
  imports: [InGridBkgComponent],
})
export class ProfilePack {
  static getMyComponent() {
    return InGridBkgComponent;
  }
}
