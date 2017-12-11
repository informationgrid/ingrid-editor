import { Component, OnInit } from '@angular/core';
import { Catalog, CatalogService } from '../catalog.service';
import { ConfigService, Configuration } from '../../services/config.service';

@Component({
  selector: 'ige-catalog-manager',
  templateUrl: './catalog-manager.component.html',
  styleUrls: ['./catalog-manager.component.css']
})
export class CatalogManagerComponent implements OnInit {

  _catalog: Catalog[];
  private uploadUrl: string;
  private config: Configuration;

  constructor(private catalogService: CatalogService, configService: ConfigService) {
    this.config = configService.getConfiguration();
  }

  ngOnInit() {
    this.catalogService.getCatalogs().subscribe( data => this._catalog = data );

    this.uploadUrl = this.config.backendUrl + 'profiles';
  }

  get catalog(): Catalog[] {
    return this._catalog;
  }

  chooseCatalog(id: string) {
    this.catalogService.forceCatalog( id );
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
