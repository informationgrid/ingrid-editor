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
import { CodelistQuery } from "../app/store/codelist/codelist.query";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { CommonFieldsLfuBayern } from "./ingrid-lufbayern/doctypes/common-fields";
import { FieldConfigPosition } from "./form-field-helper";

@Component({
  template: "",
})
class InGridLFUBayernComponent extends InGridComponent {
  codelistQuery = inject(CodelistQuery);
  common = inject(CommonFieldsLfuBayern);

  constructor() {
    super();
    this.modifyFormFieldConfiguration();
  }

  /* protected getDocTypes = () => [
    this.folder,
    this.geoDataset,
    this.geoService,
    this.dataCollection,
    this.person,
    this.organisation,
  ];*/

  private modifyFormFieldConfiguration() {
    [
      this.specialisedTask,
      this.geoDataset,
      this.publication,
      this.geoService,
      this.project,
      this.dataCollection,
      this.informationSystem,
    ].forEach((docType) => {
      docType.showAdVCompatible = false;
      docType.showAdVProductGroup = false;

      docType.manipulateDocumentFields = (fieldConfig: FormlyFieldConfig[]) => {
        this.addFields(fieldConfig, docType.id);
        return fieldConfig;
      };
    });
  }

  private addFields(fieldConfig: FormlyFieldConfig[], docType: string) {
    const f = this.common.findFieldElementWithId(fieldConfig, "pointOfContact");
    this.addAfter(f, this.common.getGeodataFieldConfig());

    const f2 = this.common.findFieldElementWithId(fieldConfig, "free");
    this.addAfter(f2, this.common.getInternalKeywordsFieldConfig());
    this.addAfter(f2, this.common.getGeologicalKeywordsFieldConfig());

    if (docType === "InGridGeoDataset") {
      this.addAfter(f, this.common.getSupplementFieldConfig());
    }

    if (docType !== "InGridSpecialisedTask") {
      this.addAfter(
        this.common.findFieldElementWithId(fieldConfig, "orderInfo"),
        this.common.getFeesFieldConfig(),
      );
      this.addAfter(
        this.common.findFieldElementWithId(fieldConfig, "useConstraints"),
        this.common.getUseConstraintsCommentFieldConfig(),
      );
    }
  }

  private addAfter(info: FieldConfigPosition, field: FormlyFieldConfig) {
    info.fieldConfig.splice(info.index + 1, 0, field);
  }
}

@NgModule({
  declarations: [InGridLFUBayernComponent],
})
export class ProfilePack {
  static getMyComponent() {
    return InGridLFUBayernComponent;
  }
}
