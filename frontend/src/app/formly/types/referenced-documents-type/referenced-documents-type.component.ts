/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
  Component,
  effect,
  ElementRef,
  inject,
  OnInit,
  signal,
  ViewChild,
} from "@angular/core";
import { DocumentAbstract } from "../../../store/document/document.model";
import { ResearchService } from "../../../+research/research.service";
import { filter, map, startWith, switchMap, tap } from "rxjs/operators";
import { FieldType } from "@ngx-formly/material";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { Router } from "@angular/router";
import { DocumentService } from "../../../services/document/document.service";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { ConfigService } from "../../../services/config/config.service";
import { FieldTypeConfig } from "@ngx-formly/core";
import { FormStateService } from "../../../+form/form-state.service";
import { MatButton } from "@angular/material/button";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { DocumentListItemComponent } from "../../../shared/document-list-item/document-list-item.component";
import { MatHint } from "@angular/material/form-field";

@UntilDestroy()
@Component({
  selector: "ige-referenced-documents-type",
  templateUrl: "./referenced-documents-type.component.html",
  styleUrls: ["./referenced-documents-type.component.scss"],
  imports: [
    MatButton,
    MatProgressSpinner,
    MatPaginator,
    DocumentListItemComponent,
    MatHint,
  ],
})
export class ReferencedDocumentsTypeComponent
  extends FieldType<FieldTypeConfig>
  implements OnInit
{
  private router = inject(Router);
  private researchService = inject(ResearchService);
  private documentService = inject(DocumentService);
  private formStateService = inject(FormStateService);

  @ViewChild("list", { read: ElementRef }) set listElement(
    content: ElementRef<HTMLElement>,
  ) {
    if (content) this.referencesElement = content;
  }

  pageSize = signal<number>(10);
  docs = signal<DocumentAbstract[]>([]);
  totalHits = signal<number>(0);
  showReferences = signal<boolean>(false);
  showToggleButton = signal<boolean>(false);
  messageNoReferences = signal<string>(null);
  referencesHint = signal<string>(null);
  isLoading = signal<boolean>(true);
  private firstLoaded: boolean;
  private currentUuid: string;
  private referencesElement: ElementRef<HTMLElement>;
  private queryOptions: string[];

  constructor() {
    super();

    effect(() => {
      this.currentUuid = this.formStateService.metadata().uuid;
      this.docs.set([]);
      this.firstLoaded = true;
      this.searchReferences(this.currentUuid).subscribe();
    });
  }

  ngOnInit(): void {
    this.currentUuid = this.form.value._uuid;
    this.showReferences.set(this.props.showOnStart ?? false);
    this.showToggleButton.set(this.props.showToggleButton ?? true);
    this.referencesHint.set(this.props.referencesHint ?? null);
    this.messageNoReferences.set(
      this.props.messageNoReferences ??
        "Es existieren keine Referenzen auf diese Adresse",
    );
    this.queryOptions = this.props.queryOptions ?? [];
    this.isLoading.set(false);

    const reloadEvent = this.documentService.reload$.pipe(
      untilDestroyed(this),
      map((item) => item.uuid),
    );

    reloadEvent
      .pipe(
        untilDestroyed(this),
        startWith(this.currentUuid),
        filter((uuid) => uuid !== undefined),
        tap(() => this.docs.set([])),
        tap(() => (this.firstLoaded = true)),
        switchMap((uuid) => this.searchReferences(uuid)),
      )
      .subscribe();
  }

  searchReferences(uuid: string, page = 1) {
    this.isLoading.set(true);
    return this.documentService
      .findIncomingReferences(uuid, this.queryOptions, page, this.pageSize())
      .pipe(
        map((response) => this.researchService.mapDocumentIcons(response)),
        tap((response) => this.totalHits.set(response.totalHits)),
        map((response) =>
          this.documentService.mapSearchResponseToDocumentAbstracts(
            response.hits,
          ),
        ),
        tap((docs) => this.docs.set(docs)),
        tap(() => this.isLoading.set(false)),
      );
  }

  toggleList() {
    this.showReferences.update((prev) => !prev);
    if (this.showReferences() && !this.firstLoaded) {
      this.docs.set([]);
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

  switchPage(pageEvent: PageEvent) {
    this.searchReferences(
      this.currentUuid,
      pageEvent.pageIndex + 1,
    ).subscribe();
  }
}
