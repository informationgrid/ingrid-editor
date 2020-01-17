import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {IgeDocument} from '../../models/ige-document';

@Component({
  selector: 'ige-form-info',
  templateUrl: './form-info.component.html',
  styleUrls: ['./form-info.component.scss']
})
export class FormInfoComponent implements OnInit {

  @Input() form: FormGroup;
  @Input() model: IgeDocument;
  @Input() sections: string[] = [];
  // @Input() expanded: Observable<boolean>;
  @Output() jumpToSection = new EventEmitter<number>();

  showDateBar;
  markFavorite;
  showMore = false;
  headerState = 'expanded';

  constructor() {
  }

  ngOnInit() {
    // this.expanded.subscribe(expand => this.headerState = expand ? 'expanded' : 'collapsed');
  }

}
