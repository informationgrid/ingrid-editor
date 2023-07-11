import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { MatDividerModule } from "@angular/material/divider";
import { MatListModule } from "@angular/material/list";
import { MatRadioModule } from "@angular/material/radio";
import { NgForOf, NgIf } from "@angular/common";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { debounceTime } from "rxjs/operators";
import { FormsModule, UntypedFormControl } from "@angular/forms";
import { LatLng, LatLngBounds, Map, Rectangle } from "leaflet";
import { Subscription } from "rxjs";
import { GeothesaurusWfsGndeService } from "./geothesaurus-wfs-gnde.service";
import { SearchInputComponent } from "../../../../../shared/search-input/search-input.component";
import { SpatialBoundingBox } from "../spatial-result.model";
import { TranslocoService } from "@ngneat/transloco";
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from "@angular/material/checkbox";
import { SpatialLocation } from "../../spatial-list/spatial-list.component";
import { LeafletService } from "../../leaflet.service";

interface GeoThesaurusResult {
  id: string;
  name: string;
  displayTitle: string;
  ars: string;
  type: string;
  bbox: SpatialBoundingBox;
  hasMoreResults: boolean;
}

@UntilDestroy()
@Component({
  selector: "ige-geothesaurus-wfsgnde",
  templateUrl: "./geothesaurus-wfsgnde.component.html",
  styleUrls: [
    "../free-spatial/free-spatial.component.scss",
    "./geothesaurus-wfsgnde.component.scss",
  ],
  standalone: true,
  imports: [
    MatDividerModule,
    MatListModule,
    MatRadioModule,
    NgForOf,
    NgIf,
    SearchInputComponent,
    MatCheckboxModule,
    FormsModule,
  ],
})
export class GeothesaurusWfsgndeComponent implements OnInit {
  @Input() map: Map;
  @Input() value: SpatialLocation;

  @Output() result = new EventEmitter<SpatialBoundingBox>();
  @Output() updateTitle = new EventEmitter<string>();

  private transloco = inject(TranslocoService);
  private thesaurus = inject(GeothesaurusWfsGndeService);
  private leafletService = inject(LeafletService);

  searchInput = new UntypedFormControl();
  showWelcome = true;
  showNoResult = false;
  geoThesaurusResults: GeoThesaurusResult[] = [];

  searchSubscribe: Subscription;
  drawnBBox: Rectangle;

  spatialSelection: GeoThesaurusResult = null;
  useArs = true;
  hasMoreResults = false;

  ngOnInit(): void {
    this.searchInput.valueChanges
      .pipe(untilDestroyed(this), debounceTime(500))
      .subscribe((query) => this.searchLocation(query));

    if (this.value.value) {
      // @ts-ignore
      this.spatialSelection = { ars: this.value.ars };
      this.drawAndZoom(this.value.value);
    } else if (!this.drawnBBox) {
      this.leafletService.zoomToInitialBox(this.map);
    }
  }

  private searchLocation(query: string) {
    if (this.searchSubscribe) this.searchSubscribe.unsubscribe();

    if (query.trim().length === 0) {
      this.showWelcome = true;
      this.geoThesaurusResults = [];
      this.hasMoreResults = false;
      return;
    }
    this.showWelcome = false;

    this.searchSubscribe = this.thesaurus
      .search(query)
      .subscribe((response: GeoThesaurusResult[]) => {
        this.applyDisplayTitle(response);
        this.geoThesaurusResults = response;
        this.showNoResult = response.length === 0;
        this.hasMoreResults = response?.[0]?.hasMoreResults ?? false;
        // @ts-ignore
        setTimeout(() => (<Map>this.map)._onResize());
      });
  }

  handleSelection(entry: GeoThesaurusResult) {
    this.spatialSelection = entry;

    this.value.title = entry.displayTitle;
    this.value.value = entry.bbox;
    // @ts-ignore
    this.value.ars = entry.ars;

    this.result.emit(entry.bbox);
    this.updateTitle.emit(entry.displayTitle);
    this.drawAndZoom(entry.bbox);
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

  private applyDisplayTitle(response: GeoThesaurusResult[]) {
    response.forEach(
      (item) =>
        (item.displayTitle = `${item.name}, ${this.transloco.translate(
          `spatial.geothesaurus.wfsgnde.${item.type}`
        )}`)
    );
  }

  updateArsUsage($event: MatCheckboxChange) {
    if ($event.checked) this.value.ars = this.spatialSelection.ars;
    else this.value.ars = null;
  }
}
