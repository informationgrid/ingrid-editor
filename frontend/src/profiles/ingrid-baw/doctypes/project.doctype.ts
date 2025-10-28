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
import { FormlyFieldConfig } from "@ngx-formly/core";
import { inject, Injectable } from "@angular/core";
import { CommonFieldsBaw } from "./common-fields";
import { ProjectDoctype } from "../../ingrid/doctypes/project.doctype";

@Injectable({
  providedIn: "root",
})
export class ProjectDoctypeBaw extends ProjectDoctype {
  common = inject(CommonFieldsBaw);

  showManager = false;
  showParticipants = false;

  manipulateDocumentFields = (fieldConfig: FormlyFieldConfig[]) => {
    this.common.addSharedFields(this, fieldConfig);
    const alternateTitlePosition = this.findFieldElementWithId(
      fieldConfig,
      "alternateTitle",
    );
    // Auftragsnummer
    this.common.addBefore(
      alternateTitlePosition,
      this.common.getOrderNumberFieldConfig(),
    );

    this.updateValidators(
      "events",
      { hasPublicationDate: this.common.hasPublicationDate },
      fieldConfig,
    );

    return fieldConfig;
  };
}
