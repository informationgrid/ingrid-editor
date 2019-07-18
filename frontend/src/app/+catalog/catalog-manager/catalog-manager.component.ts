import {Component, OnInit} from '@angular/core';
import {Catalog, CatalogService} from '../services/catalog.service';
import {ConfigService, Configuration} from '../../services/config/config.service';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import {NewCatalogDialogComponent} from '../../dialogs/catalog/new-catalog/new-catalog-dialog.component';
import {UploadProfileDialogComponent} from '../../dialogs/catalog/upload-profile/upload-profile-dialog.component';

@Component({
  selector: 'ige-catalog-manager',
  templateUrl: './catalog-manager.component.html',
  styleUrls: ['./catalog-manager.component.css']
})
export class CatalogManagerComponent implements OnInit {

  // _catalog: Catalog[];
  catalogs: Observable<Catalog[]>;
  uploadUrl: string;
  private config: Configuration;

  constructor(private router: Router, private catalogService: CatalogService, configService: ConfigService,
              private dialog: MatDialog) {
    this.config = configService.getConfiguration();
  }

  ngOnInit() {
    this.catalogs = this.catalogService.getCatalogs();

    this.uploadUrl = this.config.backendUrl + 'profiles';
  }

  showCreateCatalogDialog() {
    const newCatalogModalRef = this.dialog.open(NewCatalogDialogComponent);
    newCatalogModalRef.afterClosed().subscribe( name => {
      this.catalogService.createCatalog(name).subscribe( () => {
        this.catalogs = this.catalogService.getCatalogs();
      });
    })
  }

  showUploadProfileDialog() {
    const uploadProfileModalRef = this.dialog.open(UploadProfileDialogComponent);
  }

  chooseCatalog(id: string) {
    this.catalogService.forceCatalog( id );
  }

  showCatalogDetail(id: string) {
    this.router.navigate(['/catalogs', id]);
  }

  onUpload(event) {
    // for (const file of event.files) {
    //   this.uploadedFiles.push(file);
    // }
    //
    // this.msgs = [];
    // this.msgs.push({severity: 'info', summary: 'File Uploaded', detail: ''});
  }

  handleError(event) {
    // this.errorService.handle(event.xhr);
  }
}
