import {Component, OnInit, ViewChild} from '@angular/core';
import {BehavioursComponent} from './+behaviours/behaviours.component';
import {FormPluginsService} from '../+form/form-shared/form-plugins.service';

@Component({
  selector: 'ige-catalog-settings',
  templateUrl: './catalog-settings.component.html',
  styleUrls: ['./catalog-settings.component.scss'],
  providers: [FormPluginsService]
})
export class CatalogSettingsComponent implements OnInit {

  @ViewChild('behaviours') behaviourComponent: BehavioursComponent;


  constructor() {
  }

  ngOnInit(): void {
  }

}
