import {Component, OnInit} from '@angular/core';
import {CatalogService} from '../services/catalog.service';
import {ConfigService} from '../../services/config/config.service';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {NewCatalogDialogComponent} from '../../dialogs/catalog/new-catalog/new-catalog-dialog.component';
import {UploadProfileDialogComponent} from '../../dialogs/catalog/upload-profile/upload-profile-dialog.component';
import {CatalogDetailComponent, CatalogDetailResponse} from '../catalog-detail/catalog-detail.component';
import {Catalog} from '../services/catalog.model';
import {tap} from 'rxjs/operators';

@Component({
  selector: 'ige-catalog-manager',
  templateUrl: './catalog-manager.component.html',
  styleUrls: ['./catalog-manager.component.css']
})
export class CatalogManagerComponent implements OnInit {

  // _catalog: Catalog[];
  catalogs: Observable<Catalog[]>;
  uploadUrl: string;
  private config: ConfigService;
  noAssignedCatalogs = false;
  showSpinner = false;

  constructor(private router: Router, private catalogService: CatalogService, configService: ConfigService,
              private dialog: MatDialog) {
    this.config = configService;
  }

  ngOnInit() {
    this.catalogs = this.catalogService.getCatalogs();

    this.uploadUrl = this.config.getConfiguration().backendUrl + 'profiles';

    this.config.$userInfo.subscribe(info => this.noAssignedCatalogs = info.assignedCatalogs.length === 0);
  }

  showCreateCatalogDialog() {
    const newCatalogModalRef = this.dialog.open(NewCatalogDialogComponent);
    newCatalogModalRef.afterClosed().subscribe((catalog: Catalog) => {
      if (catalog) {
        console.log('settings are: ', catalog);
        this.showSpinner = true;
        this.catalogService.createCatalog(catalog).subscribe(() => {
          this.catalogs = this.catalogService.getCatalogs();
          this.showSpinner = false;
        });
      }
    })
  }

  showUploadProfileDialog() {
    const uploadProfileModalRef = this.dialog.open(UploadProfileDialogComponent);
  }

  chooseCatalog(id: string, $event: MouseEvent) {
    $event.stopImmediatePropagation();
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
          this.catalogService.deleteCatalog(catalog.id).pipe(
            tap(() => this.catalogs = this.catalogService.getCatalogs())
          ).subscribe();
        } else {
          // TODO: use store to manage state
          this.catalogService.updateCatalog(response.settings).pipe(
            tap(() => this.catalogs = this.catalogService.getCatalogs())
          ).subscribe();
        }
      }
    });
  }

}
