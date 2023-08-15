import { CodelistService } from "../../app/services/codelist/codelist.service";
import { Injectable } from "@angular/core";
import { IsoBaseDoctype } from "./iso-base.doctype";
import { DocumentService } from "../../app/services/document/document.service";
import { CodelistQuery } from "../../app/store/codelist/codelist.query";

export class IsoDatasetDoctype extends IsoBaseDoctype {
  id = "ISODataset";

  label = "ISO-Geodatensatz";

  constructor(
    storageService: DocumentService,
    codelistService: CodelistService,
    codelistQuery: CodelistQuery
  ) {
    super(storageService, codelistService, codelistQuery);
  }
}