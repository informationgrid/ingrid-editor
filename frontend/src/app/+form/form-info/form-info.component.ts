import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {IgeDocument} from '../../models/ige-document';
import {TreeQuery} from '../../store/tree/tree.query';
import {untilDestroyed} from 'ngx-take-until-destroy';

@Component({
  selector: 'ige-form-info',
  templateUrl: './form-info.component.html',
  styleUrls: ['./form-info.component.scss']
})
export class FormInfoComponent implements OnInit, OnDestroy {

  @Input() form: FormGroup;
  @Input() model: IgeDocument;
  @Input() sections: string[] = [];
  @Output() jumpToSection = new EventEmitter<number>();

  showDateBar;
  showMore = false;
  path: string[];

  constructor(private treeQuery: TreeQuery) {
  }

  ngOnInit() {
    this.treeQuery.pathTitles$
      .pipe(
        untilDestroyed(this)
      )
      .subscribe(path => this.path = path);
  }

  ngOnDestroy(): void {
  }

}
