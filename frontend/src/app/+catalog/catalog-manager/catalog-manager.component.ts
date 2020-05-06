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
  currentCatalog: string;
  private currentUserID: string;
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
      .subscribe(info => {
        this.currentUserID = info.userId;
        this.noAssignedCatalogs = info.assignedCatalogs.length === 0;
        this.currentCatalog = info.currentCatalog.id;
      });
  }

  showCreateCatalogDialog() {
    this.dialog.open(NewCatalogDialogComponent, {
      minWidth: 400,
      disableClose: true
    }).afterClosed()
      .subscribe((catalog: Catalog) => {
        if (catalog) {
          this.showSpinner = true;
          this.catalogService.createCatalog(catalog).subscribe((catResponse: any) => {
            this.catalogService.setCatalogAdmin(catResponse.catalogId, [this.currentUserID])
              .subscribe(() => {
                this.configService.getCurrentUserInfo();
                this.showSpinner = false;
              });
          });
        }
      });
  }

  chooseCatalog(id: string) {
    this.catalogService.switchCatalog(id).subscribe(() => {
      window.location.reload();
    });
  }

  showCatalogDetail(catalog: Catalog) {
    this.dialog.open(CatalogDetailComponent, {
      data: {...catalog},
      disableClose: true,
      minWidth: 350
    }).afterClosed().subscribe((response: CatalogDetailResponse) => {
      if (response) {

        if (response.deleted) {

          this.catalogService.deleteCatalog(catalog.id).subscribe();

        } else {

          // get this user again to update internal user info to update webapp
          this.catalogService.setCatalogAdmin(response.settings.id, response.adminUsers)
            .subscribe(() => this.configService.getCurrentUserInfo());

          this.catalogService.updateCatalog(response.settings).subscribe();

        }

      }
    });
  }

}
