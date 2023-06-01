import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from "@angular/core";
import { UntilDestroy } from "@ngneat/until-destroy";
import { LeafletService } from "../leaflet.service";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {
  SpatialLocation,
  SpatialLocationType,
} from "../spatial-list/spatial-list.component";
import { FormControl } from "@angular/forms";
import { SpatialBoundingBox } from "./spatial-result.model";
import { Map } from "leaflet";

interface LocationType {
  id: SpatialLocationType;
  label: string;
}

@UntilDestroy()
@Component({
  selector: "ige-spatial-dialog",
  templateUrl: "./spatial-dialog.component.html",
  styleUrls: ["./spatial-dialog.component.scss"],
})
export class SpatialDialogComponent implements OnInit, AfterViewInit {
  @ViewChild("leafletDlg") leaflet: ElementRef;

  dialogTitle = this.data?.value
    ? "Raumbezug bearbeiten"
    : "Raumbezug hinzufügen";

  result: SpatialLocation = {
    value: null,
    title: null,
    type: "free",
  };

  titleInput: FormControl<string>;

  leafletReference: Map;

  _bbox: any = null;
  types: LocationType[] = [
    { id: "free", label: "Freier Raumbezug" },
    { id: "wkt", label: "Raumbezug (WKT)" },
    { id: "geo-name", label: "Nur Titel" },
    { id: "wfsgnde", label: "Geothesaurus (wfs_gnde)" },
  ];
  view: SpatialLocationType;

  constructor(
    private dialogRef: MatDialogRef<SpatialDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SpatialLocation,
    private leafletService: LeafletService
  ) {
    if (this.data?.limitTypes) {
      this.types = this.types.filter(
        (type) => this.data.limitTypes.indexOf(type.id) !== -1
      );
    }
  }

  ngOnInit(): void {
    if (this.data) {
      this._bbox = this.data.value;
      this.titleInput = new FormControl(this.data.title);
      this.result = {
        value: this.data?.value,
        title: this.data?.title,
        type: this.data?.type ?? "free",
      };
    } else {
      this.titleInput = new FormControl("Neuer Raumbezug");
    }
  }

  ngAfterViewInit() {
    this.leafletReference = this.leafletService.initMap(
      this.leaflet.nativeElement,
      {}
    );
    setTimeout(() => this.updateView(this.data?.type ?? "free"));
  }

  updateBoundingBox(result: SpatialBoundingBox) {
    this.result.value = result;
  }

  updateView(viewType: SpatialLocationType) {
    this.view = viewType;
    this.result.type = viewType;
    if (viewType == "free") {
      if (!this.leafletReference.pm.controlsVisible()) {
        this.leafletReference.pm.toggleControls();
      }
    } else {
      this.result.value = null;
      if (this.leafletReference.pm.controlsVisible()) {
        this.leafletReference.pm.toggleControls();
      }
    }

    // @ts-ignore
    setTimeout(() => (<Map>this.leafletReference)._onResize());
  }

  returnResult() {
    this.result.title = this.titleInput.value ?? "";
    this.dialogRef.close(this.result);
  }
}
