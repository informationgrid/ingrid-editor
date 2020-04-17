import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {IgeDocument} from '../../models/ige-document';
import {TreeQuery} from '../../store/tree/tree.query';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {fromEvent, merge} from 'rxjs';
import {SessionQuery} from '../../store/session.query';

@Component({
  selector: 'ige-form-info',
  templateUrl: './form-info.component.html',
  styleUrls: ['./form-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormInfoComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() form: FormGroup;
  @Input() model: IgeDocument;
  @Input() sections: string[] = [];
  @Output() jumpToSection = new EventEmitter<number>();

  @ViewChild('host') host: ElementRef;

  path: string[] = [];
  private scrollHeaderOffsetLeft: number;

  constructor(private treeQuery: TreeQuery, private cdr: ChangeDetectorRef,
              private sessionQuery: SessionQuery) {
  }

  ngOnInit() {
    this.treeQuery.pathTitles$
      .pipe(
        untilDestroyed(this)
      )
      .subscribe(path => this.updatePath(path));

  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initResizeBehavior(), 1000);
  }

  private updatePath(path: string[]) {
    this.path = path.slice(0, path.length - 1);
    this.cdr.markForCheck();
  }

  private initResizeBehavior() {
    merge(
      this.sessionQuery.isSidebarExpanded$,
      this.sessionQuery.sidebarWidth$,
      fromEvent(window, 'resize')
    ).pipe(
      untilDestroyed(this)
    ).subscribe(() => {
      const offsetLeft = this.host.nativeElement.offsetLeft;
      const newValue = offsetLeft + 56;
      if (this.scrollHeaderOffsetLeft !== newValue) {
        this.scrollHeaderOffsetLeft = newValue;
        this.cdr.markForCheck();
      }
    });

  }

  ngOnDestroy(): void {
  }

}
