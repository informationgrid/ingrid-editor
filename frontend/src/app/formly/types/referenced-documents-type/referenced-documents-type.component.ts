/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import {
  ChangeDetectorRef,
  Component,
  effect,
  ElementRef,
  OnInit,
  ViewChild,
} from "@angular/core";
import { DocumentAbstract } from "../../../store/document/document.model";
import { ResearchService } from "../../../+research/research.service";
import { filter, map, startWith, switchMap, tap } from "rxjs/operators";
import { FieldType } from "@ngx-formly/material";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { Router } from "@angular/router";
import { DocumentService } from "../../../services/document/document.service";
import { PageEvent } from "@angular/material/paginator";
import { ConfigService } from "../../../services/config/config.service";
import { FieldTypeConfig } from "@ngx-formly/core";
import { FormStateService } from "../../../+form/form-state.service";

@UntilDestroy()
@Component({
  selector: "ige-referenced-documents-type",
  templateUrl: "./referenced-documents-type.component.html",
  styleUrls: ["./referenced-documents-type.component.scss"],
})
export class ReferencedDocumentsTypeComponent
  extends FieldType<FieldTypeConfig>
  implements OnInit
{
  private referencesElement: ElementRef<HTMLElement>;

  @ViewChild("list", { read: ElementRef }) set listElement(
    content: ElementRef<HTMLElement>,
  ) {
    if (content) this.referencesElement = content;
  }

  pageSize = 10;

  docs: DocumentAbstract[] = [];

  private sql = `SELECT document1.*, document_wrapper.category
                 FROM document_wrapper
                        JOIN document document1 ON document_wrapper.uuid = document1.uuid
                 WHERE document1.is_latest = true
                   AND document_wrapper.deleted = 0
                   AND jsonb_path_exists(jsonb_strip_nulls(data), '$.<referenceFieldRaw>')
                   AND EXISTS(SELECT
                              FROM jsonb_array_elements(data -> '<referenceField>') as s
                              WHERE (s -> '<uuidField>') = '"<uuid>"')`;

  private currentUuid: string;
  totalHits = 0;
  showReferences: boolean;
  showToggleButton: boolean;
  messageNoReferences: string;
  referencesHint: string;
  isLoading: boolean;
  firstLoaded: boolean;

  constructor(
    private router: Router,
    private researchService: ResearchService,
    private documentService: DocumentService,
    private formStateService: FormStateService,
    private cdr: ChangeDetectorRef,
  ) {
    super();

    effect(() => {
      this.currentUuid = this.formStateService.metadata().uuid;
      this.docs = [];
      this.firstLoaded = true;
      this.searchReferences(this.currentUuid).subscribe();
    });
  }

  ngOnInit(): void {
    this.currentUuid = this.form.value._uuid;
    this.showReferences = this.props.showOnStart ?? false;
    this.showToggleButton = this.props.showToggleButton ?? true;
    this.referencesHint = this.props.referencesHint ?? null;
    this.messageNoReferences =
      this.props.messageNoReferences ??
      "Es existieren keine Referenzen auf diese Adresse";
    this.isLoading = false;

    const reloadEvent = this.documentService.reload$.pipe(
      untilDestroyed(this),
      map((item) => item.uuid),
    );

    reloadEvent
      .pipe(
        untilDestroyed(this),
        startWith(this.currentUuid),
        filter((uuid) => uuid !== undefined),
        tap(() => (this.docs = [])),
        tap(() => (this.firstLoaded = true)),
        switchMap((uuid) => this.searchReferences(uuid)),
      )
      .subscribe();
  }

  searchReferences(uuid: string, page = 1) {
    this.isLoading = true;
    return this.researchService
      .searchBySQL(this.prepareSQL(uuid), page, this.pageSize)
      .pipe(
        tap((response) => (this.totalHits = response.totalHits)),
        map((response) =>
          this.documentService.mapSearchResponseToDocumentAbstracts(
            response.hits,
          ),
        ),
        tap((docs) => (this.docs = docs)),
        tap(() => (this.isLoading = false)),
        tap(() => this.cdr.detectChanges()),
      );
  }

  toggleList() {
    this.showReferences = !this.showReferences;
    if (this.showReferences && !this.firstLoaded) {
      this.docs = [];
      this.searchReferences(this.currentUuid).subscribe(() =>
        setTimeout(() =>
          this.referencesElement.nativeElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          }),
        ),
      );
    }
    this.firstLoaded = false;
  }

  openReference(doc: DocumentAbstract) {
    this.router.navigate([
      `${ConfigService.catalogId}/form`,
      { id: doc._uuid },
    ]);
  }

  private prepareSQL(uuid: string): string {
    return this.sql
      .replace("<uuid>", uuid)
      .replace("<uuidField>", this.props.uuidField)
      .replace(/<referenceFieldRaw>/g, this.props.referenceField)
      .replace(
        /<referenceField>/g,
        this.props.referenceField.replaceAll(".", "' -> '"),
      );
  }

  switchPage(pageEvent: PageEvent) {
    this.searchReferences(
      this.currentUuid,
      pageEvent.pageIndex + 1,
    ).subscribe();
  }
}
