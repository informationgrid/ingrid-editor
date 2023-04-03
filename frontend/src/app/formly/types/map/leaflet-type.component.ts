import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from "@angular/core";
import { FieldType } from "@ngx-formly/material";
import { Map, MapOptions, Rectangle } from "leaflet";
import { ModalService } from "../../../services/modal/modal.service";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { MatDialog } from "@angular/material/dialog";
import { SpatialDialogComponent } from "./spatial-dialog/spatial-dialog.component";
import { LeafletService } from "./leaflet.service";
import {
  SpatialLocation,
  SpatialLocationWithColor,
} from "./spatial-list/spatial-list.component";
import { distinctUntilChanged, tap } from "rxjs/operators";
import { BehaviorSubject, Observable, of } from "rxjs";
import { ContextHelpService } from "../../../services/context-help/context-help.service";
import { ConfigService } from "../../../services/config/config.service";
import { FieldTypeConfig } from "@ngx-formly/core";
import { TranslocoService } from "@ngneat/transloco";

@UntilDestroy()
@Component({
  selector: "ige-formly-leaflet-type",
  templateUrl: "leaflet-type.component.html",
  styleUrls: ["leaflet-type.component.scss"],
})
export class LeafletTypeComponent
  extends FieldType<FieldTypeConfig>
  implements AfterViewInit, OnDestroy
{
  @ViewChild("leaflet") leaflet: ElementRef;

  locationsWithColor$ = new BehaviorSubject<SpatialLocationWithColor[]>([]);
  hasAnyLocations = false;
  maxLocationsReached = false;

  private leafletReference: L.Map;
  private locations: SpatialLocation[] = [];
  private drawnSpatialRefs: Rectangle[] = [];
  mapHasMoved = false;

  private profile: string;
  private docType: string;
  private fieldId: string;

  constructor(
    private modalService: ModalService,
    private dialog: MatDialog,
    private contextHelpService: ContextHelpService,
    private configService: ConfigService,
    private leafletService: LeafletService,
    private _changeDetectionRef: ChangeDetectorRef,
    private translocoService: TranslocoService
  ) {
    super();
  }

  ngAfterViewInit() {
    this.leaflet.nativeElement.style.height = this.props.height + "px";
    this.leaflet.nativeElement.style.width = "100%";

    this.formControl.valueChanges
      .pipe(
        untilDestroyed(this),
        distinctUntilChanged(),
        tap((value) => (this.locations = value || []))
      )
      .subscribe(() => this.updateBoundingBox());

    try {
      const options: MapOptions = this.props.mapOptions;
      this.leafletReference = this.leafletService.initMap(
        this.leaflet.nativeElement,
        { ...options, scrollWheelZoom: false }
      );

      // when switching from a folder to a document with leaflet map then we need
      // to call resize event to prevent incorrect map display
      // @ts-ignore
      (<Map>this.leafletReference)._onResize();
      this.leafletReference.on("dragend", () => (this.mapHasMoved = true));

      this.locations = this.formControl.value || [];
      // delay update to prevent template error because of 'hasAnyLocations' update
      setTimeout(() => {
        try {
          this.updateBoundingBox();
        } catch (e) {
          console.warn(
            "Failed to update bounding box. map already unloaded?",
            e
          );
        }
      });
    } catch (e) {
      console.error("Problem initializing the map component.", e);
      this.updateLocations([]);
      this.formControl.setValue([]);
      throw Error("Problem initializing the map component: " + e.message);
    }

    this.profile = this.configService.$userInfo.getValue().currentCatalog.type;
    // TODO: this.model is not the whole model!!! How to get the _type?
    this.docType = this.props.docType ?? this.model?._type;
    this.fieldId = <string>this.field.key;
  }

  private updateLocations(locations: SpatialLocationWithColor[]) {
    this.hasAnyLocations = locations.length > 0;
    this.maxLocationsReached = locations.length >= this.props.max;
    this.locationsWithColor$.next(locations);
    this._changeDetectionRef.detectChanges();
  }

  private updateBoundingBox() {
    this.updateLocations([]);
    this.leafletService.removeDrawnBoundingBoxes(
      this.leafletReference,
      this.drawnSpatialRefs
    );

    const hasCoordinates = this.locations.some(
      (location) => location.type !== "geo-name"
    );

    if (this.locations.length === 0 || !hasCoordinates) {
      this.leafletService.zoomToInitialBox(this.leafletReference);
      this.leafletReference.dragging.disable();
      this.leafletReference.doubleClickZoom.disable();
    }

    const locationsWithColor = this.leafletService.extendLocationsWithColor(
      this.locations
    );
    this.updateLocations(locationsWithColor);

    if (hasCoordinates) {
      this.drawnSpatialRefs = this.leafletService.drawSpatialRefs(
        this.leafletReference,
        locationsWithColor
      );
      this.leafletReference.dragging.enable();
      this.leafletReference.doubleClickZoom.enable();
    }
  }

  /**
   * Destroy the map to handle the view cache functionality of ng2.After the first init the leaflet is already initialised.
   * See also:
   * https://github.com/angular/angular/issues/4478
   * https://github.com/angular/angular/issues/1618
   */
  public ngOnDestroy(): void {
    if (this.leafletReference && this.leafletReference.remove) {
      this.leafletReference.clearAllEventListeners();
      this.leafletReference.remove();
    }
    if (this.leaflet && this.leaflet.nativeElement.remove) {
      this.leaflet.nativeElement.remove();
    }
  }

  openSpatialDialog(locationIndex?: number) {
    console.log(
      "The Location index array size before adding / updating: ",
      this.locations.length
    );
    this.dialog
      .open(SpatialDialogComponent, {
        width: "90%",
        disableClose: true,
        maxWidth: 1260,
        minWidth: 600,
        data: {
          ...this.locations[locationIndex],
          limitTypes: this.props.limitTypes,
        },
      })
      .afterClosed()
      .subscribe((result: SpatialLocation) => {
        if (result) {
          console.log("Spatial result:", result);
          if (locationIndex >= 0) {
            this.locations[locationIndex] = result;
          } else {
            this.locations.push(result);
          }
          console.log(
            "The Location index array size after adding / updating: ",
            this.locations.length
          );
          this.formControl.setValue(this.locations);
          this.formControl.markAsDirty();
          this.updateBoundingBox();
        }
      });
  }

  removeLocation(index: number) {
    this.locations.splice(index, 1);
    this.formControl.setValue(this.locations);
    this.formControl.markAsDirty();

    this.updateBoundingBox();
  }

  highlightLocation(index: number) {
    if (index !== null) {
      if (this.locations[index].type === "geo-name") {
        return;
      }

      const bounds = this.leafletService.getBoundingBoxFromLayers([
        this.drawnSpatialRefs[index],
      ]);
      this.leafletReference.fitBounds(bounds);
    } else {
      this.updateBoundingBox();
    }

    this.mapHasMoved = this.locations.length === 1 ? false : index != null;
  }

  showContextHelp() {
    let desc: Observable<string> = of(
      this.translocoService.translate("spatial.generalHelp")
    );

    this.contextHelpService.showContextHelpPopup("Raumbezug", desc);
  }
}
