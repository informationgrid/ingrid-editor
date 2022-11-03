import { DocumentService } from "../../../app/services/document/document.service";
import { CodelistService } from "../../../app/services/codelist/codelist.service";
import { CodelistQuery } from "../../../app/store/codelist/codelist.query";
import { Injectable } from "@angular/core";
import { PersonDoctype } from "../../address/person.doctype";

@Injectable({
  providedIn: "root",
})
export class IngridPersonDoctype extends PersonDoctype {
  id = "InGridPersonDoc";

  constructor(
    storageService: DocumentService,
    codelistService: CodelistService,
    codelistQuery: CodelistQuery
  ) {
    super(storageService, codelistService, codelistQuery, "addresses");
    this.addressType = "person";
    this.options = {
      hideAdministrativeArea: true,
      defaultCountry: { key: "276" },
      inheritAddress: false,
    };
  }
}