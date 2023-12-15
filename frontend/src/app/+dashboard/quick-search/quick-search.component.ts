/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { DocumentAbstract } from "../../store/document/document.model";
import { DocumentService } from "../../services/document/document.service";
import { Router } from "@angular/router";
import { UntypedFormControl } from "@angular/forms";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { debounceTime } from "rxjs/operators";
import { combineLatest, Subscription } from "rxjs";
import { ConfigService } from "../../services/config/config.service";

@UntilDestroy()
@Component({
  selector: "ige-quick-search",
  templateUrl: "./quick-search.component.html",
  styleUrls: ["./quick-search.component.scss"],
})
export class QuickSearchComponent implements OnInit {
  @Output() selectDoc = new EventEmitter<string>();
  @Output() selectAddress = new EventEmitter<string>();

  docs: DocumentAbstract[];
  addresses: DocumentAbstract[];
  numDocs: number;
  numAddresses: number;

  query = new UntypedFormControl("");
  searchSub: Subscription;

  constructor(
    private documentService: DocumentService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.query.valueChanges
      .pipe(untilDestroyed(this), debounceTime(300))
      .subscribe((query) => this.search(query));
  }

  search(value: string) {
    if (value?.trim()?.length === 0) {
      this.docs = [];
      this.addresses = [];
      return;
    }

    this.searchSub?.unsubscribe();
    this.searchSub = combineLatest([
      this.documentService.findInTitleOrUuid(value, 5),
      this.documentService.findInTitleOrUuid(value, 5, true),
    ]).subscribe((result) => {
      this.docs = this.highlightResult(result[0].hits, value);
      this.numDocs = result[0].totalHits;

      this.addresses = this.highlightResult(result[1].hits, value);
      this.numAddresses = result[1].totalHits;
    });
  }

  openResearchPage(inAddresses?: boolean) {
    this.router.navigate([
      `${ConfigService.catalogId}/research/search`,
      {
        q: this.query.value,
        type: inAddresses ? "selectAddresses" : "selectDocuments",
      },
    ]);
  }

  private highlightResult(
    hits: DocumentAbstract[],
    textHighlight: string,
  ): DocumentAbstract[] {
    return hits.map((hit) => {
      hit.title = hit.title.replace(
        new RegExp(textHighlight, "ig"),
        (match) => `<span class="highlight">${match}</span>`,
      );

      return hit;
    });
  }
}
