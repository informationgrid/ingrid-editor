import {Component, OnInit, ViewChild} from '@angular/core';
import {BehavioursComponent} from '../+behaviours/behaviours.component';
import {ConfigService} from '../../services/config/config.service';
import {Router} from '@angular/router';
import {FormPluginsService} from '../../+form/form-shared/form-plugins.service';

@Component({
  selector: 'ige-catalog-manager',
  templateUrl: './catalog-manager.component.html',
  styleUrls: ['./catalog-manager.component.scss'],
  providers: [FormPluginsService]
})
export class CatalogManagerComponent implements OnInit {

  @ViewChild('behaviours') behaviourComponent: BehavioursComponent;
  currentCatalog: string;


  constructor(private router: Router, private configService: ConfigService) {
  }

  ngOnInit(): void {
    this.configService.$userInfo
      .subscribe(info => {
        this.currentCatalog = info.currentCatalog.id;
      });
  }

  gotoCatalogs() {
    this.router.navigate(['/catalogs/manage'])
  }
}
