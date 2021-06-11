import { CodelistService } from "../../app/services/codelist/codelist.service";
import { IsoBaseDoctype } from "./iso-base.doctype";
import { DocumentService } from "../../app/services/document/document.service";
import { CodelistQuery } from "../../app/store/codelist/codelist.query";

export class IsoDataPoolingDoctype extends IsoBaseDoctype {
  id = "ISODataPooling";

  label = "ISO-Datensammlung";

  constructor(
    storageService: DocumentService,
    codelistService: CodelistService,
    codelistQuery: CodelistQuery
  ) {
    super(storageService, codelistService, codelistQuery);
  }
}
