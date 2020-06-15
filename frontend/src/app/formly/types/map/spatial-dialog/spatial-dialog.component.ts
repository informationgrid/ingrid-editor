import {AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {UntilDestroy} from '@ngneat/until-destroy';
import {LeafletService} from '../leaflet.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {SpatialLocation} from '../spatial-list/spatial-list.component';
import {FormControl} from '@angular/forms';
import {SpatialBoundingBox} from './spatial-result.model';


@UntilDestroy()
@Component({
  selector: 'ige-spatial-dialog',
  templateUrl: './spatial-dialog.component.html',
  styleUrls: ['./spatial-dialog.component.scss']
})
export class SpatialDialogComponent implements OnInit, AfterViewInit {

  @ViewChild('leafletDlg') leaflet: ElementRef;

  result: SpatialLocation = {
    value: null,
    title: null,
    type: 'free'
  };

  titleInput: FormControl;

  leafletReference: L.Map;

  _bbox: any = null;
  types = [
    {id: 'free', label: 'Freier Raumbezug'},
    {id: 'wkt', label: 'WKT'},
    // {id: 'draw', label: 'Auf Karte zeichnen'},
    {id: 'geo-name', label: 'Geografischer Name'}
  ];
  view: 'free' | 'wkt';

  get bbox(): any {
    return this._bbox;
  }

  constructor(private dialogRef: MatDialogRef<SpatialDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: SpatialLocation,
              private leafletService: LeafletService) {
  }

  ngOnInit(): void {
    if (this.data) {
      this._bbox = this.data.value;
      this.titleInput = new FormControl(this.data.title);
    } else {
      this.titleInput = new FormControl();
    }
  }

  ngAfterViewInit() {

    this.leaflet.nativeElement.style.height = 'auto';
    this.leaflet.nativeElement.style.minHeight = 'calc(100vh - 235px)';
    this.leaflet.nativeElement.style.width = '100%';
    this.leaflet.nativeElement.style.minWidth = '400px';
    // const options: MapOptions = this.to.mapOptions;
    this.leafletReference = this.leafletService.initMap(this.leaflet.nativeElement, {});
    setTimeout(() => this.updateView(this.data ? this.data.type : 'free'));

  }

  updateBoundingBox(result: SpatialBoundingBox) {
    this.result.value = result;
  }

  updateView(id: 'free' | 'wkt') {

    this.view = id;
    this.result.type = id;
    this.result.value = null;

  }

  returnResult() {

    this.result.title = this.titleInput.value;
    this.dialogRef.close(this.result);

  }

}
