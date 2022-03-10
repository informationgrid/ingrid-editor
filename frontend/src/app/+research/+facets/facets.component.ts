import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  ViewChild,
} from "@angular/core";
import { FacetGroup, Facets, ResearchService } from "../research.service";
import { Map, Rectangle } from "leaflet";
import { LeafletService } from "../../formly/types/map/leaflet.service";
import { MatDialog } from "@angular/material/dialog";
import { SpatialDialogComponent } from "../../formly/types/map/spatial-dialog/spatial-dialog.component";
import { SpatialLocation } from "../../formly/types/map/spatial-list/spatial-list.component";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import {
  ControlValueAccessor,
  FormBuilder,
  FormGroup,
  NG_VALUE_ACCESSOR,
} from "@angular/forms";

export interface FacetUpdate {
  model: any;
  fieldsWithParameters: { [x: string]: any[] };
}

@UntilDestroy()
@Component({
  selector: "ige-facets",
  templateUrl: "./facets.component.html",
  styleUrls: ["./facets.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: FacetsComponent,
    },
  ],
})
export class FacetsComponent
  implements OnInit, AfterViewInit, ControlValueAccessor
{
  @Input() forReports: boolean;

  @Input() set facets(value: Facets) {
    if (value) {
      this.allFacets = value;
      this.updateFilterGroup();
    }
  }

  @Input() set parameter(value: any) {
    this._parameter = value;
    // delay update for other inputs to be present
    setTimeout(() => this.updateSpatialFromModel(value));
    // setTimeout(() => this.updateTimeSpanFromModel(value));
  }

  @Input() refreshView: EventEmitter<void>;

  @Input()
  set forAddresses(addresses: boolean) {
    this._forAddresses = addresses;
    if (this.allFacets) {
      this.updateFilterGroup();
    }
  }

  get forAddresses(): boolean {
    return this._forAddresses;
  }

  @ViewChild("leafletDlg") leaflet: ElementRef;

  _parameter: any = {};
  filterGroup: FacetGroup[];
  researchOnlyFilterIds = ["state"];

  private _forAddresses = false;
  private allFacets: Facets;
  private spatialFilterId = "";
  private timespanFilterId = "";
  leafletReference: L.Map;
  notExpanded: any = {};
  location: SpatialLocation;
  private boxes: Rectangle[];

  form: FormGroup = this.fb.group({});

  private onChange: (x: any) => {};
  onTouched = () => {};

  touched = false;

  disabled = false;

  private defaultValue = {
    timespan: { start: "", end: "" },
  };

  constructor(
    private dialog: MatDialog,
    private researchService: ResearchService,
    private leafletService: LeafletService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.form.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((value) => this.onChange && this.onChange(value));
  }

  writeValue(value: any): void {
    if (value) {
      this.form.setValue(
        { ...this.defaultValue, ...value },
        { emitEvent: false }
      );
      if (value.spatial) {
        console.log(
          "This facet value contains spatial information: ",
          value.spatial
        );
      }
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(onTouched: any) {
    this.onTouched = onTouched;
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  setDisabledState(disabled: boolean) {
    this.disabled = disabled;
  }

  ngAfterViewInit(): void {
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
      if (group.viewComponent === "RADIO") {
        // this.model[group.id] = group.filter[0].id;
      } else if (group.viewComponent === "TIMESPAN") {
        this.form.addControl(
          group.id,
          this.fb.group({
            start: [],
            end: [],
          })
        );
      } else {
        const groupControls = group.filter.reduce((prev, current) => {
          prev[current.id] = this.fb.control("");
          return prev;
        }, {});
        this.form.addControl(group.id, this.fb.group(groupControls));
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
        if (result) this.updateLocation(result);
      });
  }

  toggleSection(id: string) {
    this.notExpanded[id] = !this.notExpanded[id];
    if (id === "spatial" && this.notExpanded.spatial) {
      setTimeout(() => this.leafletReference.invalidateSize());
    }
  }

  private updateLocation(location: SpatialLocation) {
    this.location = location;

    if (!location) {
      this.removeSpatialFromMap();
      return;
    }

    this.updateMap(location);
    this.updateFormWithLocation(location);
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
    this.updateFormWithLocation(null);

    this.removeSpatialFromMap();
    this.boxes = null;
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
        // this.updateSpatialFromModel(this._parameter);
      }, 200);
    }
  }

  private updateSpatialFromModel(parameter: any) {
    const location = this.convertParameterToLocation(parameter);
    this.updateLocation(location);
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

  private updateFormWithLocation(location: SpatialLocation) {
    const spatialKey = Object.keys(
      (<FormGroup>this.form.get("spatial")).controls
    )[0];

    /*    let value;
    if (location) {
      value = {
        ...location,
        value: [
          location.value.lat1,
          location.value.lon1,
          location.value.lat2,
          location.value.lon2,
        ],
      };
    } else {
      value = null;
    }*/
    this.form.get(["spatial", spatialKey]).setValue(location);
  }
}
