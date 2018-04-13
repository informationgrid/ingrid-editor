import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Catalog, CatalogService } from '../catalog.service';
import { ConfigService, Configuration } from '../../services/config.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/index';

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

  @ViewChild('newCatalogModal') newCatalogModal: TemplateRef<any>;
  newCatalogModalRef: BsModalRef;

  @ViewChild('uploadProfileModal') uploadProfileModal: TemplateRef<any>;
  uploadProfileModalRef: BsModalRef;

  constructor(private router: Router, private catalogService: CatalogService, configService: ConfigService,
              private modal2Service: BsModalService) {
    this.config = configService.getConfiguration();
  }

  ngOnInit() {
    this.catalogs = this.catalogService.getCatalogs();

    this.uploadUrl = this.config.backendUrl + 'profiles';
  }

  // get catalog(): Catalog[] {
  //   return this._catalog;
  // }

  showCreateCatalogDialog() {
    this.newCatalogModalRef = this.modal2Service.show(this.newCatalogModal);
  }

  showUploadProfileDialog() {
    this.uploadProfileModalRef = this.modal2Service.show(this.uploadProfileModal);
  }

  createCatalog(name: string) {
    this.catalogService.createCatalog(name).subscribe( () => {
      this.catalogs = this.catalogService.getCatalogs();
    });
    this.newCatalogModalRef.hide();
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
