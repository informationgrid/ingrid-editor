import {Component, HostListener, Input, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {Observable} from 'rxjs';
import {IgeDocument} from '../../models/ige-document';

@Component({
  selector: 'ige-form-info',
  templateUrl: './form-info.component.html',
  styleUrls: ['./form-info.component.scss'],
  animations: [
    trigger('openClose', [
      state('collapsed, void', style({height: '50px'})),
      state('expanded', style({height: 'auto'})),
      transition('collapsed => expanded', animate('200ms ease-in')),
      transition('* => collapsed', animate('200ms ease-out'))
    ])
  ]
})
export class FormInfoComponent implements OnInit {

  @Input() form: FormGroup;
  @Input() model: IgeDocument;
  @Input() sections: string[] = [];
  @Input() expanded: Observable<boolean>;

  showDateBar;
  markFavorite;
  showMore = false;
  headerState = 'expanded';

  constructor() {
  }

  ngOnInit() {
    this.expanded.subscribe(expand => this.headerState = expand ? 'expanded' : 'collapsed');
  }

}
