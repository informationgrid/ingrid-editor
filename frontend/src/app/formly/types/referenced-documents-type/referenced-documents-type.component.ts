import { Component, OnInit } from "@angular/core";
import { DocumentAbstract } from "../../../store/document/document.model";
import { ResearchService } from "../../../+research/research.service";
import { distinctUntilChanged, filter, map, tap } from "rxjs/operators";
import { FieldType } from "@ngx-formly/material";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { Router } from "@angular/router";
import { DocumentService } from "../../../services/document/document.service";
import { PageEvent } from "@angular/material/paginator";

@UntilDestroy()
@Component({
  selector: "ige-referenced-documents-type",
  templateUrl: "./referenced-documents-type.component.html",
  styleUrls: ["./referenced-documents-type.component.scss"],
})
export class ReferencedDocumentsTypeComponent
  extends FieldType
  implements OnInit
{
  pageSize = 10;

  docs: DocumentAbstract[];

  showReferences = false;

  private sql = `SELECT document1.*, document_wrapper.*
                 FROM document_wrapper
                        JOIN document document1 ON
                   CASE
                     WHEN document_wrapper.draft IS NULL THEN document_wrapper.published = document1.id
                     ELSE document_wrapper.draft = document1.id
                     END
                 WHERE jsonb_path_exists(jsonb_strip_nulls(data), '$.<referenceField>')
                   AND EXISTS(SELECT
                              FROM jsonb_array_elements(data -> '<referenceField>') as s
                              WHERE (s -> 'ref') = '"<uuid>"')`;

  private currentUuid: string;
  totalHits: number;

  constructor(
    private router: Router,
    private researchService: ResearchService,
    private documentService: DocumentService
  ) {
    super();
  }

  ngOnInit(): void {
    this.form.valueChanges
      .pipe(
        untilDestroyed(this),
        map((value) => value._uuid),
        distinctUntilChanged(),
        tap((uuid) => (this.currentUuid = uuid)),
        filter(() => this.showReferences)
      )
      .subscribe((uuid) => this.searchReferences(uuid));
  }

  searchReferences(uuid: string, page = 1) {
    this.researchService
      .searchBySQL(this.prepareSQL(uuid), page, this.pageSize)
      .pipe(
        tap((response) => (this.totalHits = response.totalHits)),
        map((response) =>
          this.documentService.mapToDocumentAbstracts(response.hits)
        )
      )
      .subscribe((docs) => (this.docs = docs));
  }

  toggleList() {
    this.showReferences = !this.showReferences;
    this.searchReferences(this.currentUuid);
  }

  openReference(doc: DocumentAbstract) {
    this.router.navigate(["/form", { id: doc._uuid }]);
  }

  private prepareSQL(uuid: string): string {
    return this.sql
      .replace("<uuid>", uuid)
      .replace(/<referenceField>/g, this.to.referenceField);
  }

  switchPage(pageEvent: PageEvent) {
    this.searchReferences(this.currentUuid, pageEvent.pageIndex + 1);
  }
}
