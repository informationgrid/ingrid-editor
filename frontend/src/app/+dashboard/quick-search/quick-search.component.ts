import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { DocumentAbstract } from "../../store/document/document.model";
import { DocumentService } from "../../services/document/document.service";
import { Router } from "@angular/router";
import { FormControl } from "@angular/forms";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { debounceTime, finalize } from "rxjs/operators";
import { SearchResult } from "../../models/search-result.model";
import { combineLatest, Subscription } from "rxjs";

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

  query = new FormControl("");
  searchSub: Subscription;

  constructor(
    private documentService: DocumentService,
    private router: Router
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
      this.documentService.find(value, 5),
      this.documentService.find(value, 5, true),
    ]).subscribe((result) => {
      this.docs = this.highlightResult(result[0].hits, value);
      this.numDocs = result[0].totalHits;

      this.addresses = this.highlightResult(result[1].hits, value);
      this.numAddresses = result[1].totalHits;
    });
  }

  openResearchPage(event: Event, inAddresses?: boolean) {
    // TODO: activate after research page is implemented
    event.preventDefault();

    this.router.navigate([
      "/research/search",
      {
        q: this.query.value,
        type: inAddresses ? "selectAddresses" : "selectDocuments",
      },
    ]);
  }

  resetSearch() {
    this.query.reset("");
    this.searchSub?.unsubscribe();
  }

  private highlightResult(
    hits: DocumentAbstract[],
    textHighlight: string
  ): DocumentAbstract[] {
    return hits.map((hit) => {
      hit.title = hit.title.replace(
        new RegExp(textHighlight, "ig"),
        (match) => `<span class="highlight">${match}</span>`
      );

      return hit;
    });
  }
}
