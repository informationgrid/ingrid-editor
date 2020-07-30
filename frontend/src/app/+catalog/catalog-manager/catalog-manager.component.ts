import {Component, OnInit, ViewChild} from '@angular/core';
import {BehavioursComponent} from '../+behaviours/behaviours.component';
import {ConfigService} from '../../services/config/config.service';
import {Router} from '@angular/router';

@Component({
  selector: 'ige-catalog-manager',
  templateUrl: './catalog-manager.component.html',
  styleUrls: ['./catalog-manager.component.scss']
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
