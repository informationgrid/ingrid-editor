import { Component, OnInit } from '@angular/core';
import { Catalog, CatalogService } from '../catalog.service';

@Component({
  selector: 'ige-catalog-manager',
  templateUrl: './catalog-manager.component.html',
  styleUrls: ['./catalog-manager.component.css']
})
export class CatalogManagerComponent implements OnInit {

  _catalog: Catalog[];

  constructor(private catalogService: CatalogService) { }

  ngOnInit() {
    this.catalogService.getCatalogs().subscribe( data => this._catalog = data );
  }

  get catalog(): Catalog[] {
    return this._catalog;
  }

  chooseCatalog(id: string) {
    this.catalogService.forceCatalog( id );
  }
}
