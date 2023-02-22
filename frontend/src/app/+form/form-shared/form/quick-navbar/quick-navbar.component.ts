import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  Output,
} from "@angular/core";
import { combineLatest, fromEvent } from "rxjs";
import { startWith } from "rxjs/operators";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { SessionQuery } from "../../../../store/session.query";
import { IgeDocument } from "../../../../models/ige-document";
import { DocumentUtils } from "../../../../services/document.utils";
import { ProfileService } from "../../../../services/profile.service";

@UntilDestroy()
@Component({
  selector: "ige-quick-navbar",
  templateUrl: "./quick-navbar.component.html",
  styleUrls: ["./quick-navbar.component.scss"],
})
export class QuickNavbarComponent implements AfterViewInit {
  @Input() sections: string[] = [];
  @Input() hasOptionalFields = false;

  @Input() numberOfErrors: number = 0;

  @Input() set model(value: IgeDocument) {
    this.title = value.title;
    this.docIcon = this.profileService.getDocumentIcon(value);
    this.state = DocumentUtils.getStateClass(value._state, value._type);
  }

  @Output() toggleOptionalFields = new EventEmitter<boolean>();

  @HostBinding("style.left") leftOffset = "0";

  title: string;
  docIcon: string;
  state: string;

  constructor(
    private elRef: ElementRef,
    private session: SessionQuery,
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => this.initResizeBehavior(), 500);
  }

  private initResizeBehavior() {
    combineLatest([
      this.session.isSidebarExpanded$,
      this.session.sidebarWidth$,
      fromEvent(window, "resize").pipe(startWith(0)),
    ])
      .pipe(untilDestroyed(this))
      .subscribe((result) => {
        // TODO: parentElement seems to be undefined in addresses during initialization
        //       according to test "should replace address contains referenced documents with another address (#3811)"
        const offsetLeft = this.elRef.nativeElement.parentElement?.offsetLeft;
        if (offsetLeft === undefined) return;

        const menuWidth = result[0] ? 300 : 56;
        const newValue = offsetLeft + menuWidth + "px";
        if (this.leftOffset !== newValue) {
          this.leftOffset = newValue;
          this.cdr.markForCheck();
        }
      });
  }

  /*private initScrollBehavior() {
    const element = this.scrollForm.nativeElement;
    fromEvent(element, "scroll")
      .pipe(
        untilDestroyed(this),
        // debounceTime(10), // do not handle all events
        map((top): boolean => this.determineToggleState(element.scrollTop)),
        map((show) => this.toggleStickyHeader(show)),
        debounceTime(300), // update store less frequently
        tap((top) =>
          this.treeService.updateScrollPositionInStore(
            this.address,
            element.scrollTop
          )
        ),
        distinctUntilChanged()
      )
      .subscribe();
  }

  private toggleStickyHeader(show: boolean) {
    this.isStickyHeader = show;

    let height = this.stickyHeaderRef.nativeElement.clientHeight;
    this.paddingWithHeader = show ? height + "px" : "0";
  }

  private determineToggleState(top) {
    // when we scroll more than the non-sticky area then it should become sticky
    return top > this.formInfoRef.nativeElement.clientHeight;
  }*/
}
