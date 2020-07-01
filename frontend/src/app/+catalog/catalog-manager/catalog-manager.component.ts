import {Component, OnInit, ViewChild} from '@angular/core';
import {BehavioursComponent} from '../+behaviours/behaviours.component';

@Component({
  selector: 'ige-catalog-manager',
  templateUrl: './catalog-manager.component.html',
  styleUrls: ['./catalog-manager.component.scss']
})
export class CatalogManagerComponent implements OnInit {

  @ViewChild('behaviours') behaviourComponent: BehavioursComponent;

  ngOnInit(): void {
  }

}
