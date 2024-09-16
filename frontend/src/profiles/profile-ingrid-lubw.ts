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
import { FieldConfigPosition } from "./form-field-helper";
import { CommonFieldsLUBW } from "./ingrid-lubw/doctypes/common-fields";

@Component({
  template: "",
  standalone: true,
})
class InGridLUBWComponent extends InGridComponent {
  common = inject(CommonFieldsLUBW);

  constructor() {
    super();
    this.isoView.isoExportFormat = "ingridISOLUBW";
    this.modifyFormFieldConfiguration();
  }

  private modifyFormFieldConfiguration() {
    this.geoDataset.manipulateDocumentFields = (
      fieldConfig: FormlyFieldConfig[],
    ) => {
      this.addFields(fieldConfig);
      return fieldConfig;
    };
  }

  // dataQualityInfo
  // lineage
  // source
  // descriptions", "Datengrundlage",
  // processStep
  // description", "Herstellungsprozess",

  private addFields(fieldConfig: FormlyFieldConfig[]) {
    const identifierPosition = this.common.findFieldElementWithId(
      fieldConfig,
      "identifier",
    );
    const processStepPosition = this.common.findFieldElementWithId(
      fieldConfig,
      "processStep",
    );

    this.addAfter(identifierPosition, this.common.getOACFieldConfig());
    this.addAfter(
      processStepPosition,
      this.common.getEnvironmentDescriptionFieldConfig(),
    );
  }

  private addAfter(info: FieldConfigPosition, field: FormlyFieldConfig) {
    info.fieldConfig.splice(info.index + 1, 0, field);
  }
}

@NgModule({
  imports: [InGridLUBWComponent],
})
export class ProfilePack {
  static getMyComponent() {
    return InGridLUBWComponent;
  }
}
