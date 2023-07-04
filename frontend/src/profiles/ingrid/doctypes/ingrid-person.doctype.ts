import { DocumentService } from "../../../app/services/document/document.service";
import { Injectable } from "@angular/core";
import { PersonDoctype } from "../../address/person.doctype";

@Injectable({
  providedIn: "root",
})
export class IngridPersonDoctype extends PersonDoctype {
  id = "InGridPersonDoc";

  constructor(storageService: DocumentService) {
    super(storageService, "pointOfContact");
    this.addressType = "person";
    this.options = {
      defaultCountry: { key: "276" },
      inheritAddress: false,
      requiredField: { administrativeArea: true },
      positionNameAndHoursOfService: true,
    };
  }
}
