import { DocumentService } from "../../app/services/document/document.service";
import { CodelistService } from "../../app/services/codelist/codelist.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { BaseDoctype } from "../base.doctype";
import { CodelistQuery } from "../../app/store/codelist/codelist.query";
import { IgeDocument } from "../../app/models/ige-document";
import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";
import { AddressDoctype } from "../address/address.doctype";

@Injectable({
  providedIn: "root",
})
export class TestAddressDoctype extends AddressDoctype {
  id = "AddressDoc";

  constructor(
    storageService: DocumentService,
    codelistService: CodelistService,
    codelistQuery: CodelistQuery
  ) {
    super(storageService, codelistService, codelistQuery);
  }
}
