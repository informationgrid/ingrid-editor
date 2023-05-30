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
      inheritAddress: false,
    };
  }
}
