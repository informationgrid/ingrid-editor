import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { UntypedFormControl } from "@angular/forms";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { debounceTime } from "rxjs/operators";
import { NominatimResult, NominatimService } from "../../nominatim.service";
import { LatLng, LatLngBounds, Map, Rectangle } from "leaflet";
import "@geoman-io/leaflet-geoman-free";
import { SpatialBoundingBox } from "../spatial-result.model";
import { LeafletService } from "../../leaflet.service";
import { Subscription } from "rxjs";

@UntilDestroy()
@Component({
  selector: "ige-free-spatial",
  templateUrl: "./free-spatial.component.html",
  styleUrls: ["./free-spatial.component.scss"],
})
export class FreeSpatialComponent implements OnInit, OnDestroy {
  @Input() map: Map;

  @Input() set coordinates(value: SpatialBoundingBox) {
    if (!value) return;
    setTimeout(() => this.drawAndZoom(value));
  }

  @Output() result = new EventEmitter<SpatialBoundingBox>();
  @Output() updateTitle = new EventEmitter<string>();

  nominatimResult: NominatimResult[] = [];
  searchInput = new UntypedFormControl();
  showNoResult = false;
  showWelcome = true;

  drawnBBox: Rectangle;
  spatialSelection: NominatimResult = null;
  searchSubscribe: Subscription;

  constructor(
    private nominatimService: NominatimService,
    private leafletService: LeafletService
  ) {}

  ngOnInit(): void {
    this.searchInput.valueChanges
      .pipe(untilDestroyed(this), debounceTime(500))
      .subscribe((query) => this.searchLocation(query));

    if (!this.drawnBBox) {
      this.leafletService.zoomToInitialBox(this.map);
    }

    this.addDrawControls();
  }

  ngOnDestroy() {
    this.removeDrawnBoundingBox();
  }

  searchLocation(query: string) {
    if (query.trim().length === 0) {
      this.showWelcome = true;
      this.nominatimResult = [];
      return;
    }
    this.showWelcome = false;

    this.searchSubscribe = this.nominatimService
      .search(query)
      .subscribe((response: NominatimResult[]) => {
        response = response
          .filter((item) => item.type !== "city")
          .map((item) => FreeSpatialComponent.addTypeToDisplayName(item));
        this.nominatimResult = response;
        console.log("Nominatim:", response);
        this.showNoResult = response.length === 0;
        // @ts-ignore
        setTimeout(() => (<Map>this.map)._onResize());
      });
  }

  private static addTypeToDisplayName(item: NominatimResult): NominatimResult {
    if (item.type) {
      item.display_name += ` (${item.type})`;
    }
    return item;
  }

  handleSelection(item: NominatimResult) {
    this.spatialSelection = item;

    const box = item.boundingbox;
    const value = {
      lat1: +box[0],
      lon1: +box[2],
      lat2: +box[1],
      lon2: +box[3],
    };

    this.drawAndZoom(value);

    this.result.emit(value);
    this.updateTitle.emit(item.display_name);
  }

  private drawAndZoom(value: SpatialBoundingBox) {
    const bounds = new LatLngBounds(
      new LatLng(value.lat1, value.lon1),
      new LatLng(value.lat2, value.lon2)
    );
    this.drawBoundingBox(bounds);

    this.map.fitBounds(bounds);
  }

  private drawBoundingBox(latLonBounds: LatLngBounds) {
    this.removeDrawnBoundingBox();
    this.drawnBBox = new Rectangle(latLonBounds).addTo(this.map);

    this.drawnBBox.on("pm:edit", (e) =>
      // @ts-ignore
      this.updateSelectedArea(e.layer.getBounds())
    );
  }

  private removeDrawnBoundingBox() {
    if (this.drawnBBox) {
      const bbox = this.drawnBBox;
      setTimeout(() => this.map.removeLayer(bbox), 100);
      this.drawnBBox = null;
    }
  }

  private updateSelectedArea(bounds: LatLngBounds) {
    this.result.emit({
      lat1: bounds.getSouthWest().lat,
      lon1: bounds.getSouthWest().lng,
      lat2: bounds.getNorthEast().lat,
      lon2: bounds.getNorthEast().lng,
    });
  }

  private addDrawControls() {
    this.map.pm.addControls({
      position: "topleft",
      drawCircle: false,
      drawMarker: false,
      drawPolygon: false,
      drawText: false,
      drawCircleMarker: false,
      drawPolyline: false,
      cutPolygon: false,
      rotateMode: false,
    });
    this.map.pm.setLang("de");

    this.map.on("pm:drawstart", () => {
      this.removeDrawnBoundingBox();
    });

    this.map.on("pm:create", (createEvent) => {
      // @ts-ignore
      this.drawnBBox = createEvent.layer;
      // @ts-ignore
      this.updateSelectedArea(createEvent.layer.getBounds());
      createEvent.layer.on("pm:edit", (editEvent) => {
        // @ts-ignore
        this.updateSelectedArea(editEvent.layer.getBounds());
      });
    });
  }
}
