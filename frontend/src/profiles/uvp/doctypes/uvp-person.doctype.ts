import { DocumentService } from "../../../app/services/document/document.service";
import { Injectable } from "@angular/core";
import { PersonDoctype } from "../../address/person.doctype";

@Injectable({
  providedIn: "root",
})
export class UvpPersonDoctype extends PersonDoctype {
  id = "UvpAddressDoc";

  constructor(storageService: DocumentService) {
    super(storageService, "pointOfContact");
    this.addressType = "person";
    this.options = {
      hideAdministrativeArea: true,
      defaultCountry: { key: "276" },
      inheritAddress: false,
    };
  }
}
