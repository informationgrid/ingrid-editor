import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  Output,
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
  NG_VALUE_ACCESSOR,
  UntypedFormBuilder,
  UntypedFormGroup,
} from "@angular/forms";
import { BehaviorSubject, Observable } from "rxjs";
import { filter, take } from "rxjs/operators";
import {
  CodelistService,
  SelectOptionUi,
} from "../../services/codelist/codelist.service";
import { BehaviourService } from "../../services/behavior/behaviour.service";

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
      useExisting: forwardRef(() => FacetsComponent),
    },
  ],
})
export class FacetsComponent implements OnInit, ControlValueAccessor {
  // TODO: remove input and filter facets from report component
  @Input() forReports: boolean;

  @Input() set facets(value: Facets) {
    if (value) {
      this.allFacets = value;
      this.updateFilterGroup();
      this.facetsInitialized.next(true);
    }
  }

  @Input() refreshView: EventEmitter<void>;

  @Output() resetQuery = new EventEmitter<void>();

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

  filterGroup: FacetGroup[];
  researchOnlyFilterIds = ["state"];

  leafletReference: L.Map;
  notExpanded: any = {};
  location: SpatialLocation;

  codelistOptions: { [x: string]: Observable<SelectOptionUi[]> } = {};

  private _forAddresses = false;
  private allFacets: Facets;
  private boxes: Rectangle[];
  private facetsInitialized = new BehaviorSubject<boolean>(false);
  timeGroupId: string;

  form: UntypedFormGroup = this.fb.group({});

  private onChange: (x: any) => {};
  onTouched = () => {};

  disabled = false;

  constructor(
    private dialog: MatDialog,
    private researchService: ResearchService,
    private leafletService: LeafletService,
    private fb: UntypedFormBuilder,
    public codelistService: CodelistService,
    private behaviourService: BehaviourService
  ) {}

  ngOnInit(): void {
    this.form.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((value) => this.onChange && this.onChange(value));
  }

  writeValue(value: any): void {
    if (value) {
      this.facetsInitialized
        .pipe(
          filter((isReady) => isReady),
          take(1)
        )
        .subscribe(() => {
          // reset form and remove spatial before updating form
          // we cannot use setValue on form in case the query doesn't contain all fields
          // which would lead to an error. So we clear the form and set only the supplied values
          this.form.reset();
          this.updateLocation(null);
          this.form.patchValue(value);
          if (value.spatial) {
            this.updateSpatialFromModel(value.spatial[this.getSpatialKey()]);
          }
        });
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(onTouched: any) {
    this.onTouched = onTouched;
  }

  setDisabledState(disabled: boolean) {
    this.disabled = disabled;
  }

  initLeaflet() {
    if (this.leaflet) {
      this.leaflet.nativeElement.style.minHeight = "200px";
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
        // TODO: implement
      } else if (group.viewComponent === "TIMESPAN") {
        this.timeGroupId = group.id;
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

        this.handleCodelistForSelect(group);
      }
    });
  }

  private handleCodelistForSelect(group: FacetGroup) {
    let codelistId = group.filter[0].codelistId;
    if (codelistId) {
      this.codelistOptions[group.id] = this.codelistService.observe(codelistId);
    } else {
      let behaviourId = group.filter[0].codelistIdFromBehaviour;
      if (behaviourId) {
        const behaviourAndField = behaviourId.split("::");
        const id =
          this.behaviourService.getBehaviour(behaviourAndField[0])?.data?.[
            behaviourAndField[1]
          ] ?? behaviourAndField[2];

        this.codelistOptions[group.id] = this.codelistService.observe(id);
      }
    }
  }

  showSpatialDialog(location: SpatialLocation = null) {
    const data: Partial<SpatialLocation> = location ?? {
      type: "free",
    };
    data.limitTypes = ["free"];

    this.dialog
      .open(SpatialDialogComponent, {
        data: data,
        restoreFocus: true,
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

  // TODO: refactor map to separate component
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
    this.setDefaultModel(filter);
    this.filterGroup = filter;

    if (filter.some((f) => f.viewComponent === "SPATIAL")) {
      setTimeout(() => {
        this.initLeaflet();
        // this.updateSpatialFromModel(this._parameter);
      }, 200);
    }
  }

  private updateSpatialFromModel(location: any) {
    this.updateLocation(location);
  }

  private updateFormWithLocation(location: SpatialLocation) {
    const spatialKey = this.getSpatialKey();

    this.form.get(["spatial", spatialKey]).setValue(location);
  }

  private getSpatialKey() {
    return Object.keys(
      (<UntypedFormGroup>this.form.get("spatial")).controls
    )[0];
  }

  filterForStartDate = (d: Date | null): boolean => {
    const endDate = this.form.get(this.timeGroupId).get("end").value;
    return endDate === null || d <= endDate;
  };

  filterForEndDate = (d: Date | null): boolean => {
    return d >= this.form.get(this.timeGroupId).get("start").value;
  };

  resetDateFields() {
    this.form.get(this.timeGroupId).get("start").setValue(null);
    this.form.get(this.timeGroupId).get("end").setValue(null);
  }
}
