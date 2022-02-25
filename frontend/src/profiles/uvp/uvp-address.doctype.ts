import { DocumentService } from "../../app/services/document/document.service";
import { CodelistService } from "../../app/services/codelist/codelist.service";
import { CodelistQuery } from "../../app/store/codelist/codelist.query";
import { Injectable } from "@angular/core";
import { AddressDoctype } from "../address/address.doctype";

@Injectable({
  providedIn: "root",
})
export class UvpAddressDoctype extends AddressDoctype {
  id = "UvpAddressDoc";

  constructor(
    storageService: DocumentService,
    codelistService: CodelistService,
    codelistQuery: CodelistQuery
  ) {
    super(storageService, codelistService, codelistQuery);
  }
}
