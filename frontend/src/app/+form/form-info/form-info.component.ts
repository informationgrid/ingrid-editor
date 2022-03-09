import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { FormGroup } from "@angular/forms";
import { IgeDocument } from "../../models/ige-document";
import { TreeQuery } from "../../store/tree/tree.query";
import { combineLatest, fromEvent } from "rxjs";
import { SessionQuery } from "../../store/session.query";
import {
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
  tap,
} from "rxjs/operators";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { ProfileService } from "../../services/profile.service";
import { AddressTreeQuery } from "../../store/address-tree/address-tree.query";
import {
  ADDRESS_ROOT_NODE,
  DOCUMENT_ROOT_NODE,
} from "../../store/document/document.model";
import { TreeStore } from "../../store/tree/tree.store";
import { AddressTreeStore } from "../../store/address-tree/address-tree.store";
import { DocumentUtils } from "../../services/document.utils";
import { TreeService } from "../sidebars/tree/tree.service";
import { FormUtils } from "../form.utils";
import { DocumentService } from "../../services/document/document.service";
import { MatDialog } from "@angular/material/dialog";
import { ShortTreeNode } from "../sidebars/tree/tree.types";
import { Router } from "@angular/router";

export interface StickyHeaderInfo {
  show: boolean;
  headerHeight: number;
}

@UntilDestroy()
@Component({
  selector: "ige-form-info",
  templateUrl: "./form-info.component.html",
  styleUrls: ["./form-info.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormInfoComponent implements OnInit, AfterViewInit {
  @Input() form: FormGroup;

  _model: IgeDocument;
  @Input() set model(value: IgeDocument) {
    this._model = value;
    this.docIcon = this.profileService.getDocumentIcon(value);
    this.state = DocumentUtils.getStateClass(value._state, value._type);
  }

  @Input() sections: string[] = [];
  @Input() parentContainer: HTMLElement;
  @Input() forAddress = false;
  @Output() showStickyHeader = new EventEmitter<StickyHeaderInfo>();

  @ViewChild("host") host: ElementRef;
  @ViewChild("sticky_header", { read: ElementRef }) stickyHeader: ElementRef;

  path: ShortTreeNode[] = [];
  scrollHeaderOffsetLeft: number;

  showScrollHeader = false;
  rootName: string;
  docIcon: string;
  state: string;
  private initialHeaderOffset: number;
  private store: AddressTreeStore | TreeStore;
  private query: AddressTreeQuery | TreeQuery;

  constructor(
    private router: Router,
    private treeQuery: TreeQuery,
    private addressTreeQuery: AddressTreeQuery,
    private treeService: TreeService,
    private treeStore: TreeStore,
    private addressTreeStore: AddressTreeStore,
    private cdr: ChangeDetectorRef,
    private sessionQuery: SessionQuery,
    private documentService: DocumentService,
    private dialog: MatDialog,
    private profileService: ProfileService
  ) {}

  ngOnInit() {
    if (this.forAddress) {
      this.rootName = ADDRESS_ROOT_NODE.title;
      this.query = this.addressTreeQuery;
      this.store = this.addressTreeStore;
    } else {
      this.rootName = DOCUMENT_ROOT_NODE.title;
      this.query = this.treeQuery;
      this.store = this.treeStore;
    }

    this.query.breadcrumb$
      .pipe(
        untilDestroyed(this),
        tap((path) => (this.path = path.slice(0, -1))),
        tap(() => this.cdr.markForCheck())
      )
      .subscribe();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initResizeBehavior(), 500);

    this.initScrollBehavior();
  }

  private initResizeBehavior() {
    combineLatest([
      this.sessionQuery.isSidebarExpanded$,
      this.sessionQuery.sidebarWidth$,
      fromEvent(window, "resize").pipe(startWith(0)),
    ])
      .pipe(untilDestroyed(this))
      .subscribe((result) => {
        setTimeout(() => {
          const offsetLeft = this.host.nativeElement.offsetLeft;
          const menuWidth = result[0] ? 300 : 56;
          const newValue = offsetLeft + menuWidth;
          if (this.scrollHeaderOffsetLeft !== newValue) {
            this.scrollHeaderOffsetLeft = newValue;
            this.cdr.markForCheck();
          }
        }, 100);
      });
  }

  private initScrollBehavior() {
    const element = this.parentContainer;
    fromEvent(element, "scroll")
      .pipe(
        untilDestroyed(this),
        debounceTime(10), // do not handle all events
        map((top): boolean => this.determineToggleState(element.scrollTop)),
        map((show) => this.toggleStickyHeader(show)),
        debounceTime(300), // update store less frequently
        tap((top) => this.updateScrollPositionInStore(element.scrollTop)),
        distinctUntilChanged()
      )
      .subscribe();
  }

  private toggleStickyHeader(show: boolean) {
    this.showScrollHeader = show;
    this.showStickyHeader.next({
      show,
      headerHeight: this.stickyHeader.nativeElement.clientHeight,
    });
  }

  private determineToggleState(top) {
    if (!this.showScrollHeader) {
      this.initialHeaderOffset = this.stickyHeader.nativeElement.offsetTop - 56;
    }

    return top > this.initialHeaderOffset;
  }

  private updateScrollPositionInStore(top) {
    this.store.update({
      scrollPosition: top,
    });
  }

  async scrollToTreeNode(nodeId: string) {
    let handled = await FormUtils.handleDirtyForm(
      this.form,
      this.documentService,
      this.dialog,
      this.forAddress
    );
    if (handled) {
      this.treeService.selectTreeNode(this.forAddress, nodeId);
      const uuid = this.query.getEntity(nodeId)._uuid;
      this.router.navigate([
        this.forAddress ? "/address" : "/form",
        { id: uuid },
      ]);
    }
  }
}
