import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { debounceTime } from "rxjs/operators";
import { NominatimResult, NominatimService } from "../../nominatim.service";
import { MatSelectionListChange } from "@angular/material/list";
import { LeafletAreaSelect } from "../../leaflet-area-select";
import { LatLng, LatLngBounds, Map, Rectangle } from "leaflet";
import { SpatialBoundingBox } from "../spatial-result.model";
import { LeafletService } from "../../leaflet.service";

@UntilDestroy()
@Component({
  selector: "ige-free-spatial",
  templateUrl: "./free-spatial.component.html",
  styleUrls: ["./free-spatial.component.scss"],
})
export class FreeSpatialComponent implements OnInit, OnDestroy {
  @Input() map: Map;
  @Input() initial: SpatialBoundingBox;
  @Input() hideTitle: boolean;
  @Output() result = new EventEmitter<SpatialBoundingBox>();
  @Output() updateTitle = new EventEmitter<string>();

  nominatimResult: NominatimResult[] = [];
  searchInput = new FormControl();
  showNoResult = false;
  showWelcome = true;

  private areaSelect: LeafletAreaSelect = null;
  drawnBBox: any;
  spatialSelection: NominatimResult = null;

  constructor(
    private nominatimService: NominatimService,
    private leafletService: LeafletService
  ) {}

  ngOnInit(): void {
    this.searchInput.valueChanges
      .pipe(untilDestroyed(this), debounceTime(500))
      .subscribe((query) => this.searchLocation(query));

    if (this.initial) {
      this.drawAndZoom(this.initial);
    } else {
      this.leafletService.zoomToInitialBox(this.map);
    }

    // avoid wrong change detection
    setTimeout(() => this.setupAreaSelect());
  }

  ngOnDestroy() {
    if (this.areaSelect) {
      this.areaSelect.clearAllEventListeners();
      this.areaSelect.remove();
    }
  }

  searchLocation(query: string) {
    if (query.trim().length === 0) {
      this.showWelcome = true;
      this.nominatimResult = [];
      return;
    }
    this.showWelcome = false;

    this.nominatimService
      .search(query)
      .subscribe((response: NominatimResult[]) => {
        this.nominatimResult = response;
        console.log("Nominatim:", response);
        this.showNoResult = response.length === 0;
        // @ts-ignore
        setTimeout(() => (<Map>this.map)._onResize());
      });
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

    this.result.next(value);
    this.updateTitle.next(item.display_name);
  }

  private drawAndZoom(value: {
    lat1: number;
    lat2: number;
    lon1: number;
    lon2: number;
  }) {
    const bounds = new LatLngBounds(
      new LatLng(value.lat1, value.lon1),
      new LatLng(value.lat2, value.lon2)
    );
    this.drawBoundingBox(bounds);

    this.map.fitBounds(bounds).once("zoomend", () => {
      setTimeout(() => this.updateAreaSelectPosition(), 10);
    });
    setTimeout(() => this.updateAreaSelectPosition(), 270);
  }

  private drawBoundingBox(latLonBounds: LatLngBounds) {
    this.removeDrawnBoundingBox();
    this.drawnBBox = new Rectangle(latLonBounds, {
      color: "#ff7800",
      weight: 1,
    }).addTo(this.map);
  }

  private removeDrawnBoundingBox() {
    if (this.drawnBBox) {
      const bbox = this.drawnBBox;
      setTimeout(() => this.map.removeLayer(bbox), 100);
      this.drawnBBox = null;
    }
  }

  private setupAreaSelect() {
    const box = this.drawnBBox ? this.drawnBBox._path.getBBox() : null;
    if (box) {
      this.areaSelect = new LeafletAreaSelect(box);
    } else {
      this.areaSelect = new LeafletAreaSelect({ width: 50, height: 50 });
    }
    this.areaSelect.on("change", () => this.updateSelectedArea());
    this.areaSelect.addTo(this.map);
  }

  private updateSelectedArea() {
    const bounds = this.areaSelect.getBounds();
    this.result.next({
      lat1: bounds.getSouthWest().lat,
      lon1: bounds.getSouthWest().lng,
      lat2: bounds.getNorthEast().lat,
      lon2: bounds.getNorthEast().lng,
    });
  }

  private updateAreaSelectPosition() {
    if (this.drawnBBox) {
      const box = this.drawnBBox._path.getBBox();
      this.areaSelect.setDimensions(box);
    }
  }
}
