import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ChangeDetectorRef,
} from "@angular/core";
import { DocumentAbstract } from "../../store/document/document.model";
import { DocumentService } from "../../services/document/document.service";
import { Router } from "@angular/router";
import { FormControl } from "@angular/forms";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { debounceTime, finalize, map } from "rxjs/operators";

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
  isSearching = false;
  addressSub;
  documentSub;

  constructor(
    private documentService: DocumentService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.query.valueChanges
      .pipe(untilDestroyed(this), debounceTime(300))
      .subscribe((query) => this.search(query));
  }
  private isLoading() {
    this.isSearching = true;
    this.cdr.detectChanges();
  }

  search(value: string) {
    if (value?.trim()?.length === 0) {
      this.docs = [];
      this.addresses = [];
      return;
    }
    this.isLoading();
    this.documentSub = this.documentService
      .find(value, 5)
      .pipe(
        finalize(() => {
          this.isSearching = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe((result) => {
        this.docs = this.highlightResult(result.hits, value);
        this.numDocs = result.totalHits;
      });
    this.addressSub = this.documentService
      .find(value, 5, true)
      .pipe(
        finalize(() => {
          this.isSearching = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe((result) => {
        this.addresses = this.highlightResult(result.hits, value);
        this.numAddresses = result.totalHits;
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

  resetForm() {
    this.query.reset("");
    this.addressSub.unsubscribe();
    this.documentSub.unsubscribe();
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
