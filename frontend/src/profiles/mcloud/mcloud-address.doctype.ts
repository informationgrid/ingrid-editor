import { DocumentService } from "../../app/services/document/document.service";
import { Injectable } from "@angular/core";
import { OrganisationDoctype } from "../address/organisation.doctype";

@Injectable({
  providedIn: "root",
})
export class McloudAddressDoctype extends OrganisationDoctype {
  id = "McloudAddressDoc";

  label = "Adresse";

  constructor(storageService: DocumentService) {
    super(storageService, "addresses");
    this.addressType = "organization";
    this.options = {
      hideCountryAndAdministrativeArea: true,
    };
  }
}
