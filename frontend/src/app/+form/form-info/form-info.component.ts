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
  ViewChild
} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {IgeDocument} from '../../models/ige-document';
import {TreeQuery} from '../../store/tree/tree.query';
import {combineLatest, fromEvent} from 'rxjs';
import {SessionQuery} from '../../store/session.query';
import {distinctUntilChanged, map, startWith, throttleTime} from 'rxjs/operators';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {ProfileService} from '../../services/profile.service';

export interface StickyHeaderInfo {
  show: boolean;
  headerHeight: number;
}

@UntilDestroy()
@Component({
  selector: 'ige-form-info',
  templateUrl: './form-info.component.html',
  styleUrls: ['./form-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormInfoComponent implements OnInit, AfterViewInit {

  @Input() form: FormGroup;
  @Input() model: IgeDocument;
  @Input() sections: string[] = [];
  @Input() parentContainer: HTMLElement;
  @Output() showStickyHeader = new EventEmitter<StickyHeaderInfo>();

  @ViewChild('host') host: ElementRef;
  @ViewChild('sticky_header', {read: ElementRef}) stickyHeader: ElementRef;

  path: string[] = [];
  scrollHeaderOffsetLeft: number;

  showScrollHeader = false;
  private initialHeaderOffset: number;

  constructor(private treeQuery: TreeQuery, private cdr: ChangeDetectorRef,
              private sessionQuery: SessionQuery,
              private profileService: ProfileService) {
  }

  ngOnInit() {
    this.treeQuery.pathTitles$
      .pipe(untilDestroyed(this))
      .subscribe(path => this.updatePath(path));

  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initResizeBehavior(), 500);

    this.initScrollBehavior();
  }

  private updatePath(path: string[]) {
    this.path = path.slice(0, path.length - 1);
    this.cdr.markForCheck();
  }

  private initResizeBehavior() {
    combineLatest([
      this.sessionQuery.isSidebarExpanded$,
      this.sessionQuery.sidebarWidth$,
      fromEvent(window, 'resize').pipe(startWith(0))
    ]).pipe(untilDestroyed(this))
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
    fromEvent(element, 'scroll').pipe(
      untilDestroyed(this),
      throttleTime(10), // do not handle all events
      map(() => element.scrollTop),
      map((top): boolean => this.determineToggleState(top)),
      distinctUntilChanged(),
    ).subscribe(show => this.toggleStickyHeader(show));

  }

  private toggleStickyHeader(show: boolean) {
    this.showScrollHeader = show;
    this.showStickyHeader.next({
      show,
      headerHeight: this.stickyHeader.nativeElement.clientHeight
    });
  }

  private determineToggleState(top) {
    if (!this.showScrollHeader) {
      this.initialHeaderOffset = this.stickyHeader.nativeElement.offsetTop - 56;
    }
    return top > this.initialHeaderOffset;
  }


  getIcon() {
    return this.profileService.getProfileIcon(this.form.get('_profile').value);
  }

  // TODO: refactor since it's used in tree-component also
  getStateClass() {
    switch (this.model._state) {
      case 'W':
        return 'working';
      case 'PW':
        return 'workingWithPublished';
      case 'P':
        return 'published';
      default:
        console.error('State is not supported: ' + this.model._state);
        throw new Error('State is not supported: ' + this.model._state);
    }
  }

}
