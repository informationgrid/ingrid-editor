/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  Inject,
  OnInit,
  signal,
  viewChild,
} from "@angular/core";
import { LeafletService } from "../leaflet.service";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from "@angular/material/dialog";
import {
  BwastrSection,
  SpatialDialogData,
  SpatialLocation,
  SpatialLocationType,
} from "../spatial-list/spatial-list.component";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { SpatialBoundingBox } from "./spatial-result.model";
import { Map } from "leaflet";
import { TranslocoService } from "@jsverse/transloco";
import { debounceTime } from "rxjs/operators";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { MatFormField } from "@angular/material/form-field";
import { MatSelect } from "@angular/material/select";
import { MatOption } from "@angular/material/core";
import { FreeSpatialComponent } from "./free-spatial/free-spatial.component";
import { WktSpatialComponent } from "./wkt-spatial/wkt-spatial.component";
import { GeothesaurusWfsgndeComponent } from "./geothesaurus-wfsgnde/geothesaurus-wfsgnde.component";
import { MatInput } from "@angular/material/input";
import { CoordinatesSpatialComponent } from "./coordinates-spatial/coordinates-spatial.component";
import { BwastrSpatialComponent } from "./bwastr-spatial/bwastr-spatial.component";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

interface LocationType {
  id: SpatialLocationType;
  label: string;
}

@Component({
  selector: "ige-spatial-dialog",
  templateUrl: "./spatial-dialog.component.html",
  styleUrls: ["./spatial-dialog.component.scss"],
  imports: [
    MatIconButton,
    MatDialogClose,
    MatIcon,
    MatDialogTitle,
    MatDialogContent,
    MatFormField,
    MatSelect,
    MatOption,
    FreeSpatialComponent,
    WktSpatialComponent,
    GeothesaurusWfsgndeComponent,
    MatInput,
    ReactiveFormsModule,
    CoordinatesSpatialComponent,
    MatDialogActions,
    MatButton,
    BwastrSpatialComponent,
  ],
})
export class SpatialDialogComponent implements OnInit, AfterViewInit {
  private transloco = inject(TranslocoService);
  private destroyRef = inject(DestroyRef);

  readonly leaflet = viewChild<ElementRef>("leafletDlg");

  dialogTitle = signal<string>(
    this.data?.location?.value
      ? "Raumbezug bearbeiten"
      : "Raumbezug hinzufügen",
  );

  result = signal<SpatialLocation>({
    value: null,
    title: null,
    type: "free",
    ars: undefined,
  });

  titleInput = new FormControl<string>("");

  leafletReference: Map;

  _bbox: any = null;
  types = signal<LocationType[]>([
    { id: "free", label: this.transloco.translate("spatial.types.free") },
    { id: "wkt", label: this.transloco.translate("spatial.types.wkt") },
    { id: "wfsgnde", label: this.transloco.translate("spatial.types.wfsgnde") },
    { id: "bwastr", label: this.transloco.translate("spatial.types.bwastr") },
  ]);
  view = signal<SpatialLocationType | null>(null);

  constructor(
    private dialogRef: MatDialogRef<SpatialDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SpatialDialogData,
    private leafletService: LeafletService,
  ) {
    if (this.data?.limitTypes) {
      this.types.update((types) =>
        types.filter((type) => this.data.limitTypes.indexOf(type.id) !== -1),
      );
    }
  }

  ngOnInit(): void {
    this.titleInput.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((title) => this.result.update((r) => ({ ...r, title })));

    if (this.data?.location) {
      const location = this.data.location;
      this._bbox = location.value;
      this.titleInput.setValue(location.title);
      this.result.update((r) => ({ ...r, ...location }));
    } else {
      this.titleInput.setValue("Neuer Raumbezug");
    }
  }

  ngAfterViewInit() {
    this.leafletReference = this.leafletService.initMap(
      this.leaflet().nativeElement,
      {},
    );
    setTimeout(() => this.updateView(this.data?.location?.type ?? "free"));
  }

  updateBoundingBox(result: SpatialBoundingBox) {
    this.result.update((r) => ({ ...r, value: result }));
  }

  updateBwastr(result: BwastrSection) {
    this.result.update((r) => ({ ...r, bwastr: result }));
  }

  updateView(viewType: SpatialLocationType) {
    this.view.set(viewType);
    this.result.update((r) => ({ ...r, type: viewType }));
    this.titleInput.enable();
    if (viewType !== "wkt")
      this.result.update((r) => ({ ...r, wkt: undefined }));
    if (viewType !== "bwastr")
      this.result.update((r) => ({ ...r, bwastr: undefined }));
    if (viewType == "free") {
      if (!this.leafletReference.pm.controlsVisible()) {
        this.leafletReference.pm.toggleControls();
      }
    } else {
      if (viewType !== "wfsgnde") {
        this.result.update((r) => ({ ...r, value: null }));
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
        this.leaflet().nativeElement.querySelectorAll('[role="button"]');
      this.setTabIgnore(buttons);
    });
  }

  private setTabIgnore(elements) {
    for (const element of elements) {
      element.setAttribute("tabindex", -1);
    }
  }

  updateWkt(wkt: string) {
    this.result.update((r) => ({ ...r, wkt }));
  }

  returnResult() {
    this.dialogRef.close(this.result());
  }
}
