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
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  ViewChild,
} from "@angular/core";
import { FieldType } from "@ngx-formly/material";
import { GeoJSON, Map, MapOptions, Polyline } from "leaflet";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { MatDialog } from "@angular/material/dialog";
import { SpatialDialogComponent } from "./spatial-dialog/spatial-dialog.component";
import { LeafletService } from "./leaflet.service";
import {
  SpatialListComponent,
  SpatialLocation,
  SpatialLocationWithColor,
} from "./spatial-list/spatial-list.component";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { of } from "rxjs";
import { ContextHelpService } from "../../../services/context-help/context-help.service";
import { FieldTypeConfig } from "@ngx-formly/core";
import { TranslocoDirective, TranslocoService } from "@jsverse/transloco";
import { MatButton, MatFabButton } from "@angular/material/button";
import { MatTooltip } from "@angular/material/tooltip";
import { NgClass } from "@angular/common";
import { MatIcon } from "@angular/material/icon";
import { FormErrorComponent } from "../../../+form/form-shared/ige-form-error/form-error.component";

@UntilDestroy()
@Component({
  selector: "ige-formly-leaflet-type",
  templateUrl: "leaflet-type.component.html",
  styleUrls: ["leaflet-type.component.scss"],
  imports: [
    MatFabButton,
    MatTooltip,
    NgClass,
    MatIcon,
    MatButton,
    FormErrorComponent,
    SpatialListComponent,
    TranslocoDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeafletTypeComponent
  extends FieldType<FieldTypeConfig>
  implements AfterViewInit, OnDestroy
{
  private dialog = inject(MatDialog);
  private contextHelpService = inject(ContextHelpService);
  private leafletService = inject(LeafletService);
  private translocoService = inject(TranslocoService);

  @ViewChild("leaflet") leaflet: ElementRef;

  locationsWithColor = signal<SpatialLocationWithColor[]>([]);
  hasAnyLocations = computed<boolean>(
    () => this.locationsWithColor().length > 0,
  );
  maxLocationsReached = computed<boolean>(
    () => this.locationsWithColor().length >= this.props.max,
  );
  mapHasMoved = signal<boolean>(false);

  private leafletReference: L.Map;
  private drawnSpatialRefs: (Polyline<any> | GeoJSON)[] = [];

  ngAfterViewInit() {
    this.leaflet.nativeElement.style.height = this.props.height + "px";
    this.leaflet.nativeElement.style.width = "100%";

    this.formControl.valueChanges
      .pipe(untilDestroyed(this), debounceTime(0), distinctUntilChanged())
      .subscribe((value) => this.updateBoundingBoxCatchingErrors(value || []));

    try {
      const options: MapOptions = this.props.mapOptions;
      this.leafletReference = this.leafletService.initMap(
        this.leaflet.nativeElement,
        { ...options, scrollWheelZoom: false },
      );

      // when switching from a folder to a document with leaflet map then we need
      // to call resize event to prevent incorrect map display
      // @ts-ignore
      (<Map>this.leafletReference)._onResize();
      this.leafletReference.on("dragend", () => this.mapHasMoved.set(true));

      const locations = this.formControl.value || [];
      // delay update to prevent template error because of 'hasAnyLocations' update
      setTimeout(() => this.updateBoundingBoxCatchingErrors(locations));
    } catch (e) {
      console.error("Problem initializing the map component.", e);
      this.updateLocations([]);
      this.formControl.setValue([]);
      throw Error("Problem initializing the map component: " + e.message);
    }
  }

  private updateBoundingBoxCatchingErrors(
    locations: SpatialLocationWithColor[],
  ) {
    try {
      this.updateBoundingBox(locations);
    } catch (e) {
      console.warn("Failed to update bounding box. Map already unloaded?", e);
    }
  }

  private updateLocations(locations: SpatialLocationWithColor[]) {
    this.locationsWithColor.set(locations);
  }

  private updateBoundingBox(locations: SpatialLocation[]) {
    this.updateLocations([]);
    this.leafletService.removeDrawnBoundingBoxes(
      this.leafletReference,
      this.drawnSpatialRefs,
    );

    const hasCoordinates = locations.some((location) =>
      this.leafletService.containsCoordinates(location),
    );

    // we need to call fitBounds in order to fully initialize map (see #7508)
    this.leafletService.zoomToInitialBox(this.leafletReference);
    if (locations.length === 0 || !hasCoordinates) {
      this.leafletReference.dragging.disable();
      this.leafletReference.doubleClickZoom.disable();
    }

    const coloredLocations =
      this.leafletService.extendLocationsWithColor(locations);
    this.updateLocations(coloredLocations);

    if (hasCoordinates) {
      this.leafletService
        .drawSpatialRefs(this.leafletReference, coloredLocations)
        .then((spatialRefs) => {
          this.drawnSpatialRefs = spatialRefs.filter(
            (item) => item !== undefined,
          );
          this.leafletReference.dragging.enable();
          this.leafletReference.doubleClickZoom.enable();
        });
    }
  }

  /**
   * Destroy the map to handle the view cache functionality of ng2.After the first init the leaflet is already initialised.
   * See also:
   * https://github.com/angular/angular/issues/4478
   * https://github.com/angular/angular/issues/1618
   */
  public ngOnDestroy(): void {
    try {
      if (this.leafletReference && this.leafletReference.remove) {
        this.leafletReference.clearAllEventListeners();
        this.leafletReference.remove();
      }
      if (this.leaflet && this.leaflet.nativeElement.remove) {
        this.leaflet.nativeElement.remove();
      }
    } catch (e) {
      console.warn(
        "Failed to update bounding box during destroy. Map already unloaded?",
        e,
      );
    }
  }

  openSpatialDialog(locationIndex?: number) {
    const locations = this.formControl.value ?? [];
    this.dialog
      .open(SpatialDialogComponent, {
        width: "90%",
        disableClose: true,
        maxWidth: 1260,
        minWidth: "min(600px, 100%)",
        data: {
          location: locations[locationIndex],
          limitTypes: this.props.limitTypes,
        },
        ariaLabel: "Raumbezug hinzufügen",
      })
      .afterClosed()
      .subscribe((result: SpatialLocation) => {
        if (result) {
          if (locationIndex >= 0) {
            locations[locationIndex] = result;
          } else {
            locations.push(result);
          }

          this.formControl.setValue([...locations]);
          this.formControl.markAsDirty();
          this.updateBoundingBoxCatchingErrors();
        }
      });
  }

  removeLocation(index: number) {
    this.formControl.value.splice(index, 1);
    this.formControl.setValue([...this.formControl.value]);
    this.formControl.markAsDirty();

    this.updateBoundingBoxCatchingErrors();
  }

  highlightLocation(index: number) {
    const locations: SpatialLocation[] = this.formControl.value;
    if (index !== null) {
      if (!this.leafletService.containsCoordinates(locations[index])) return;

      const bounds = this.leafletService.getBoundingBoxFromLayers([
        this.drawnSpatialRefs[index],
      ]);
      if (bounds) this.leafletReference.fitBounds(bounds);
    } else {
      this.updateBoundingBoxCatchingErrors();
    }

    this.mapHasMoved.set(locations.length === 1 ? false : index != null);
  }

  showContextHelp() {
    this.contextHelpService.showContextHelpPopup(
      "Raumbezug",
      of(this.translocoService.translate("spatial.generalHelp")),
    );
  }
}
