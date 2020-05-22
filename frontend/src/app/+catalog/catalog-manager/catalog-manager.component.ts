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

  ngOnInit(): void {
  }

}
