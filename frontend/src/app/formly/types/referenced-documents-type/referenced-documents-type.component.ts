import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { DocumentAbstract } from "../../../store/document/document.model";
import { ResearchService } from "../../../+research/research.service";
import { distinctUntilChanged, filter, map, tap } from "rxjs/operators";
import { FieldType } from "@ngx-formly/material";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { Router } from "@angular/router";
import { DocumentService } from "../../../services/document/document.service";
import { PageEvent } from "@angular/material/paginator";
import { DocEventsService } from "../../../services/event/doc-events.service";
import { merge } from "rxjs";

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
  private referencesElement: ElementRef<HTMLElement>;

  @ViewChild("list", { read: ElementRef }) set listElement(
    content: ElementRef<HTMLElement>
  ) {
    if (content) this.referencesElement = content;
  }

  pageSize = 10;

  docs: DocumentAbstract[];

  showReferences = false;

  private sql = `SELECT document1.*, document_wrapper.*
                 FROM document_wrapper
                        JOIN document document1 ON document_wrapper.uuid=document1.uuid
                 WHERE document1.is_latest = true AND document_wrapper.deleted = 0 AND jsonb_path_exists(jsonb_strip_nulls(data), '$.<referenceField>')
                   AND EXISTS(SELECT
                              FROM jsonb_array_elements(data -> '<referenceField>') as s
                              WHERE (s -> 'ref') = '"<uuid>"')`;

  private currentUuid: string;
  totalHits: number;

  constructor(
    private router: Router,
    private researchService: ResearchService,
    private documentService: DocumentService,
    private docEvents: DocEventsService
  ) {
    super();
  }

  ngOnInit(): void {
    const loadEvent = this.docEvents.afterLoadAndSet$(true).pipe(
      untilDestroyed(this),
      map((value) => value._uuid),
      distinctUntilChanged(),
      tap((uuid) => (this.currentUuid = uuid))
    );

    const reloadEvent = this.documentService.reload$.pipe(
      untilDestroyed(this),
      map((item) => item.uuid)
    );

    merge(loadEvent, reloadEvent)
      .pipe(
        untilDestroyed(this),
        filter(() => this.showReferences),
        tap(() => (this.docs = []))
      )
      .subscribe((uuid) => this.searchReferences(uuid).subscribe());

    this.currentUuid = this.form.value._uuid;
  }

  searchReferences(uuid: string, page = 1) {
    return this.researchService
      .searchBySQL(this.prepareSQL(uuid), page, this.pageSize)
      .pipe(
        tap((response) => (this.totalHits = response.totalHits)),
        map((response) =>
          this.documentService.mapToDocumentAbstracts(response.hits)
        ),
        tap((docs) => (this.docs = docs))
      );
  }

  toggleList() {
    this.showReferences = !this.showReferences;
    if (this.showReferences) {
      this.docs = [];
      this.searchReferences(this.currentUuid).subscribe(() =>
        setTimeout(() => this.referencesElement.nativeElement.scrollIntoView())
      );
    }
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
    this.searchReferences(
      this.currentUuid,
      pageEvent.pageIndex + 1
    ).subscribe();
  }
}
