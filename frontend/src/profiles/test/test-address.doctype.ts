import { DocumentService } from "../../app/services/document/document.service";
import { Injectable } from "@angular/core";
import { PersonDoctype } from "../address/person.doctype";

@Injectable({
  providedIn: "root",
})
export class TestAddressDoctype extends PersonDoctype {
  id = "AddressDoc";

  constructor(storageService: DocumentService) {
    super(storageService, "addresses");
  }
}
