import { DocumentService } from "../../../app/services/document/document.service";
import { Injectable } from "@angular/core";
import { OrganisationDoctype } from "../../address/organisation.doctype";

@Injectable({
  providedIn: "root",
})
export class IngridOrganisationDoctype extends OrganisationDoctype {
  id = "InGridOrganisationDoc";

  constructor(storageService: DocumentService) {
    super(storageService, "pointOfContact");
    this.addressType = "organization";
    this.options = {
      defaultCountry: { key: "276" },
      inheritAddress: false,
      requiredField: { administrativeArea: true },
      positionNameAndHoursOfService: true,
    };
  }
}
