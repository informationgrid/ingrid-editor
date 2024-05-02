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
import { DocumentService } from "../../../app/services/document/document.service";
import { Injectable } from "@angular/core";
import { OrganisationDoctype } from "../../address/organisation.doctype";

@Injectable({
  providedIn: "root",
})
export class UvpOrganisationDoctype extends OrganisationDoctype {
  id = "UvpOrganisationDoc";

  constructor(storageService: DocumentService) {
    super(storageService, "pointOfContact");
    this.addressType = "organization";
    this.options = {
      hideAdministrativeArea: true,
      defaultCountry: { key: "276" },
    };
  }
}
