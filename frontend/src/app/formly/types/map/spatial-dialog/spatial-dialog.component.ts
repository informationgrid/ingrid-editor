import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  Inject,
  OnInit,
  ViewChild,
} from "@angular/core";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { LeafletService } from "../leaflet.service";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {
  SpatialLocation,
  SpatialLocationType,
} from "../spatial-list/spatial-list.component";
import { FormControl } from "@angular/forms";
import { SpatialBoundingBox } from "./spatial-result.model";
import { Map } from "leaflet";
import { TranslocoService } from "@ngneat/transloco";
import { debounceTime } from "rxjs/operators";

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

  private transloco = inject(TranslocoService);

  dialogTitle = this.data?.value
    ? "Raumbezug bearbeiten"
    : "Raumbezug hinzufügen";

  result: SpatialLocation = {
    value: null,
    title: null,
    type: "free",
    ars: null,
  };

  titleInput = new FormControl<string>("");

  leafletReference: Map;

  _bbox: any = null;
  types: LocationType[] = [
    { id: "free", label: this.transloco.translate("spatial.types.free") },
    { id: "wkt", label: this.transloco.translate("spatial.types.wkt") },
    { id: "wfsgnde", label: this.transloco.translate("spatial.types.wfsgnde") },
  ];
  view: SpatialLocationType;

  constructor(
    private dialogRef: MatDialogRef<SpatialDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SpatialLocation,
    private leafletService: LeafletService,
  ) {
    if (this.data?.limitTypes) {
      this.types = this.types.filter(
        (type) => this.data.limitTypes.indexOf(type.id) !== -1,
      );
    }
  }

  ngOnInit(): void {
    this.titleInput.valueChanges
      .pipe(untilDestroyed(this), debounceTime(500))
      .subscribe((title) => (this.result.title = title));

    if (this.data) {
      this._bbox = this.data.value;
      this.titleInput.setValue(this.data.title);
      this.result = {
        value: this.data?.value,
        title: this.data?.title,
        type: this.data?.type ?? "free",
        ars: this.data?.ars,
      };
    } else {
      this.titleInput.setValue("Neuer Raumbezug");
    }
  }

  ngAfterViewInit() {
    this.leafletReference = this.leafletService.initMap(
      this.leaflet.nativeElement,
      {},
    );
    setTimeout(() => this.updateView(this.data?.type ?? "free"));
  }

  updateBoundingBox(result: SpatialBoundingBox) {
    this.result.value = result;
  }

  updateView(viewType: SpatialLocationType) {
    this.view = viewType;
    this.result.type = viewType;
    this.titleInput.enable();
    if (viewType == "free") {
      if (!this.leafletReference.pm.controlsVisible()) {
        this.leafletReference.pm.toggleControls();
      }
    } else {
      if (viewType !== "wfsgnde") {
        this.result.value = null;
      } else this.titleInput.disable();
      if (this.leafletReference.pm.controlsVisible()) {
        this.leafletReference.pm.toggleControls();
      }
    }

    setTimeout(() => {
      // @ts-ignore
      (<Map>this.leafletReference)._onResize();

      // ignore buttons for restricted accessibility
      const buttons =
        this.leaflet.nativeElement.querySelectorAll('[role="button"]');
      this.setTabIgnore(buttons);
    });
  }

  private setTabIgnore(elements) {
    for (const element of elements) {
      element.setAttribute("tabindex", -1);
    }
  }

  returnResult() {
    this.dialogRef.close(this.result);
  }
}
