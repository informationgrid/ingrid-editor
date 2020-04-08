import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {IgeDocument} from '../../models/ige-document';
import {TreeQuery} from '../../store/tree/tree.query';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {animate, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'ige-form-info',
  templateUrl: './form-info.component.html',
  styleUrls: ['./form-info.component.scss'],
  animations: [
    trigger('grow', [
      transition('void <=> *', []),
      transition('* <=> *', [
        style({height: '{{startHeight}}px', opacity: 0}),
        animate('.2s ease'),
      ], {params: {startHeight: 0}})
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormInfoComponent implements OnInit, OnDestroy {

  @Input() form: FormGroup;
  @Input() model: IgeDocument;
  @Input() sections: string[] = [];
  @Output() jumpToSection = new EventEmitter<number>();

  @Input() trigger: boolean;
  startHeight = 48;

  showDateBar;
  showMore = false;
  path: string[] = [];

  constructor(private treeQuery: TreeQuery, private element: ElementRef) {
  }

  ngOnInit() {
    this.treeQuery.pathTitles$
      .pipe(
        untilDestroyed(this)
      )
      .subscribe(path => this.path = path.slice(0, path.length - 1));
  }

  ngOnDestroy(): void {
  }

}
