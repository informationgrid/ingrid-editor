import { DocumentService } from "../../../app/services/document/document.service";
import { CodelistService } from "../../../app/services/codelist/codelist.service";
import { CodelistQuery } from "../../../app/store/codelist/codelist.query";
import { Injectable } from "@angular/core";
import { OrganisationDoctype } from "../../address/organisation.doctype";

@Injectable({
  providedIn: "root",
})
export class IngridOrganisationDoctype extends OrganisationDoctype {
  id = "InGridOrganisationDoc";

  constructor(
    storageService: DocumentService,
    codelistService: CodelistService,
    codelistQuery: CodelistQuery
  ) {
    super(storageService, codelistService, codelistQuery, "addresses");
    this.addressType = "organization";
    this.options = {
      defaultCountry: { key: "276" },
      inheritAddress: false,
      requiredField: { administrativeArea: true },
    };
  }
}
