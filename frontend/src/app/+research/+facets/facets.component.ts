import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from "@angular/core";
import { FacetGroup, Facets, ResearchService } from "../research.service";
import { Map, Rectangle } from "leaflet";
import { tap } from "rxjs/operators";
import { LeafletService } from "../../formly/types/map/leaflet.service";
import { MatDialog } from "@angular/material/dialog";
import { SpatialDialogComponent } from "../../formly/types/map/spatial-dialog/spatial-dialog.component";
import { SpatialLocation } from "../../formly/types/map/spatial-list/spatial-list.component";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { FormControl, FormGroup } from "@angular/forms";
import { BehaviorSubject } from "rxjs";

export interface FacetUpdate {
  model: any;
  fieldsWithParameters: { [x: string]: any[] };
}

@UntilDestroy()
@Component({
  selector: "ige-facets",
  templateUrl: "./facets.component.html",
  styleUrls: ["./facets.component.scss"],
})
export class FacetsComponent implements AfterViewInit {
  @Input() model: any;
  @Input() forReports: boolean;

  _parameter: any = {};
  @Input() set parameter(value: any) {
    this._parameter = value;
    if (this.isInitialized.value) {
      // delay update for other inputs to be present
      setTimeout(() => this.updateSpatialFromModel(value));
      setTimeout(() => this.updateTimeSpanFromModel(value));
    }
  }

  @Input() refreshView: EventEmitter<void>;

  @Input()
  set forAddresses(addresses: boolean) {
    this._forAddresses = addresses;
    if (this.allFacets) {
      this.updateFilterGroup();
      this.sendUpdate();
    }
  }

  get forAddresses(): boolean {
    return this._forAddresses;
  }

  @Output() update = new EventEmitter<FacetUpdate>();
  @Output() isInitialized = new BehaviorSubject<boolean>(false);

  @ViewChild("leafletDlg") leaflet: ElementRef;

  filterGroup: FacetGroup[];
  researchOnlyFilterIds = ["state"];

  private _forAddresses = false;
  private allFacets: Facets;
  private spatialFilterId = "";
  private timespanFilterId = "";
  private fieldsWithParameters: { [x: string]: any[] } = {};
  leafletReference: L.Map;
  notExpanded: any = {};
  location: SpatialLocation;
  private boxes: Rectangle[];

  timeSpanForm = new FormGroup({
    startDate: new FormControl(),
    endDate: new FormControl(),
  });

  constructor(
    private dialog: MatDialog,
    private researchService: ResearchService,
    private leafletService: LeafletService
  ) {}

  ngAfterViewInit(): void {
    this.researchService
      .getQuickFilter()
      .pipe(
        tap((filters) => (this.allFacets = filters)),
        tap(() => this.updateFilterGroup()),
        tap(() => this.sendUpdate()),
        tap(() => {
          this.isInitialized.next(true);
          this.updateSpatialFromModel(this._parameter);
          this.updateTimeSpanFromModel(this._parameter);
        })
      )
      .subscribe();

    if (this.refreshView && this.leafletReference) {
      this.refreshView.pipe(untilDestroyed(this)).subscribe(() => {
        if (this.leaflet) this.refreshLeafletView();
      });
    }
  }

  private refreshLeafletView(): void {
    // @ts-ignore
    (<Map>this.leafletReference)._onResize();
    if (Object.keys(this._parameter).length > 0) {
      setTimeout(() =>
        this.updateMap(this.convertParameterToLocation(this._parameter))
      );
    } else {
      setTimeout(() =>
        this.leafletService.zoomToInitialBox(this.leafletReference)
      );
    }
  }

  initLeaflet() {
    if (this.leaflet) {
      this.leaflet.nativeElement.style.height = "200px";
      this.leaflet.nativeElement.style.minWidth = "200px";
      this.leafletReference = this.leafletService.initMap(
        this.leaflet.nativeElement,
        {}
      );
      this.leafletService.zoomToInitialBox(this.leafletReference);
      // @ts-ignore
      setTimeout(() => (<Map>this.leafletReference)._onResize());
    }
  }

  private setDefaultModel(filters: FacetGroup[]) {
    filters.forEach((group) => {
      if (!this.model) {
        this.model = {};
      }
      if (this.model[group.id]) {
        // skip initialization, since it's already done for this field
        return;
      }

      this.model[group.id] = {};
      if (group.viewComponent === "RADIO") {
        this.model[group.id] = group.filter[0].id;
      } else if (group.viewComponent === "TIMESPAN") {
        this.model[group.id][this.timespanFilterId] = {
          start: null,
          end: null,
        };
      }
    });
  }

  private determineSpatialFilterId(filters: FacetGroup[]) {
    return filters.find((group) => group.viewComponent === "SPATIAL")?.filter[0]
      ?.id;
  }

  private determineTimeSpanFilterId(filters: FacetGroup[]) {
    return filters.find((group) => group.viewComponent === "TIMESPAN")
      ?.filter[0]?.id;
  }

  sendUpdate() {
    // important: delay update until model is updated
    setTimeout(() => {
      this.update.emit({
        // send copy since this will be send to store and made immutable
        model: JSON.parse(JSON.stringify(this.model)),
        fieldsWithParameters: { ...this.fieldsWithParameters },
      });
    });
  }

  showSpatialDialog(location: SpatialLocation = null) {
    const data: Partial<SpatialLocation> = location ?? {
      type: "free",
    };
    data.limitTypes = ["free"];

    this.dialog
      .open(SpatialDialogComponent, {
        data: data,
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) this.updateSpatial(result);
      });
  }

  toggleSection(id: string) {
    this.notExpanded[id] = !this.notExpanded[id];
    if (id === "spatial" && this.notExpanded.spatial) {
      setTimeout(() => this.leafletReference.invalidateSize());
    }
  }

  private updateSpatial(location: SpatialLocation) {
    this.location = location;

    if (!location) {
      this.removeSpatialFromMap();
      return;
    }

    this.model.spatial = {};
    this.model.spatial[this.spatialFilterId] = [];
    this.fieldsWithParameters[this.spatialFilterId] = [
      location.value.lat1,
      location.value.lon1,
      location.value.lat2,
      location.value.lon2,
    ];

    this.updateMap(location);

    this.sendUpdate();
  }

  updateStartTimeSpan(start: Date) {
    const startDate = start ? new Date(start) : null;
    this.updateTime(startDate, 0);
  }

  updateEndTimeSpan(end: Date) {
    const endDate = end ? new Date(end) : null;
    if (endDate) endDate.setDate(endDate.getDate() + 1);
    this.updateTime(endDate, 1);
  }

  private updateTime(date: Date, position: number) {
    if (!(this.fieldsWithParameters[this.timespanFilterId]?.length > 1)) {
      this.fieldsWithParameters[this.timespanFilterId] = [null, null];
    }
    this.fieldsWithParameters[this.timespanFilterId][position] = date;
    this.sendUpdate();
  }

  private updateMap(location: SpatialLocation) {
    if (!this.leafletReference) {
      console.log("Map not initialized yet ... try again updating spatial");
      setTimeout(() => this.updateMap(location), 100);
      return;
    }

    this.removeSpatialFromMap();
    if (location) {
      this.boxes = this.leafletService.drawSpatialRefs(this.leafletReference, [
        {
          value: location.value,
          type: location.type,
          title: location.title,
          color: this.leafletService.getColor(0),
          indexNumber: 0,
        },
      ]);
    }
  }

  private removeSpatialFromMap() {
    if (!this.boxes) return;

    this.leafletService.removeDrawnBoundingBoxes(
      this.leafletReference,
      this.boxes
    );
  }

  removeLocation() {
    this.location = null;
    delete this.fieldsWithParameters.spatial;
    delete this.model.spatial[this.spatialFilterId];
    this.leafletService.removeDrawnBoundingBoxes(
      this.leafletReference,
      this.boxes
    );
    this.boxes = null;

    this.sendUpdate();
  }

  private updateFilterGroup() {
    let filter = this.allFacets[this._forAddresses ? "addresses" : "documents"];
    if (this.forReports)
      filter = filter.filter(
        (fg) => !this.researchOnlyFilterIds.includes(fg.id)
      );
    this.spatialFilterId = this.determineSpatialFilterId(filter);
    this.timespanFilterId = this.determineTimeSpanFilterId(filter);
    this.setDefaultModel(filter);
    this.filterGroup = filter;

    if (filter.some((f) => f.viewComponent === "SPATIAL")) {
      setTimeout(() => {
        this.initLeaflet();
        this.updateSpatialFromModel(this._parameter);
      }, 200);
    }
    if (filter.some((f) => f.viewComponent === "TIMESPAN")) {
      this.updateTimeSpanFromModel(this._parameter);
    }
  }

  private updateSpatialFromModel(parameter: any) {
    const location = this.convertParameterToLocation(parameter);
    this.updateSpatial(location);
  }

  private updateTimeSpanFromModel(parameter: any) {
    if (!parameter || !parameter[this.timespanFilterId]) {
      this.timeSpanForm.reset();
      return;
    }
    const timespan = parameter[this.timespanFilterId];
    this.timeSpanForm.setValue({
      startDate: timespan[0],
      endDate: timespan[1],
    });
  }

  private convertParameterToLocation(parameter: any): SpatialLocation {
    if (!parameter || !parameter[this.spatialFilterId]) {
      return null;
    }
    const coords = parameter[this.spatialFilterId];
    return <SpatialLocation>{
      title: null,
      type: "free",
      value: {
        lat1: coords[0],
        lon1: coords[1],
        lat2: coords[2],
        lon2: coords[3],
      },
    };
  }
}
