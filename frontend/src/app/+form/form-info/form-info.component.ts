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
import {startWith} from 'rxjs/operators';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';

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
  @Output() jumpToSection = new EventEmitter<number>();

  @ViewChild('host') host: ElementRef;

  path: string[] = [];
  scrollHeaderOffsetLeft: number;

  constructor(private treeQuery: TreeQuery, private cdr: ChangeDetectorRef,
              private sessionQuery: SessionQuery) {
  }

  ngOnInit() {
    this.treeQuery.pathTitles$
      .pipe(untilDestroyed(this))
      .subscribe(path => this.updatePath(path));

  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initResizeBehavior(), 500);
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
        console.log('resize!', result);
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

}
