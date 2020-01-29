import {Component, OnInit} from '@angular/core';
import {CatalogService} from '../services/catalog.service';
import {ConfigService} from '../../services/config/config.service';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {NewCatalogDialogComponent} from '../../dialogs/catalog/new-catalog/new-catalog-dialog.component';
import {CatalogDetailComponent, CatalogDetailResponse} from '../catalog-detail/catalog-detail.component';
import {Catalog} from '../services/catalog.model';
import {CatalogQuery} from '../../store/catalog/catalog.query';

@Component({
  selector: 'ige-catalog-manager',
  templateUrl: './catalog-manager.component.html',
  styleUrls: ['./catalog-manager.component.scss']
})
export class CatalogManagerComponent implements OnInit {

  catalogs = this.catalogQuery.selectAll();

  noAssignedCatalogs = false;
  showSpinner = false;
  trackByCatalogId = (index, item: Catalog) => {
    return item.id;
  };

  constructor(private router: Router,
              private catalogService: CatalogService,
              private configService: ConfigService,
              private catalogQuery: CatalogQuery,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.catalogService.getCatalogs().subscribe();

    this.configService.$userInfo
      .subscribe(info => this.noAssignedCatalogs = info.assignedCatalogs.length === 0);
  }

  showCreateCatalogDialog() {
    const newCatalogModalRef = this.dialog.open(NewCatalogDialogComponent);
    newCatalogModalRef.afterClosed().subscribe((catalog: Catalog) => {
      if (catalog) {
        console.log('settings are: ', catalog);
        this.showSpinner = true;
        this.catalogService.createCatalog(catalog).subscribe(() => {
          this.showSpinner = false;
        });
      }
    })
  }

  chooseCatalog(id: string) {
    this.catalogService.switchCatalog(id).subscribe(() => {
      window.location.reload();
    });
  }

  showCatalogDetail(catalog: Catalog) {
    const editCatalogModalRef = this.dialog.open(CatalogDetailComponent, {
      data: catalog,
      minWidth: 350
    });
    editCatalogModalRef.afterClosed().subscribe((response: CatalogDetailResponse) => {
      if (response) {
        if (response.deleted) {
          this.catalogService.deleteCatalog(catalog.id).subscribe();
        } else {
          this.catalogService.updateCatalog(response.settings).subscribe();
        }
      }
    });
  }

}
