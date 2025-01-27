/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { MatDividerModule } from "@angular/material/divider";
import { MatListModule } from "@angular/material/list";
import { MatRadioModule } from "@angular/material/radio";

import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { debounceTime } from "rxjs/operators";
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormControl,
  Validators,
} from "@angular/forms";
import { LatLng, LatLngBounds, Map, Polyline } from "leaflet";
import { Subscription } from "rxjs";
import { SearchInputComponent } from "../../../../../shared/search-input/search-input.component";
import { MatCheckboxModule } from "@angular/material/checkbox";
import {
  BwastrSection,
  SpatialLocation,
} from "../../spatial-list/spatial-list.component";
import { LeafletService } from "../../leaflet.service";
import {
  BwastrLocatorCoordinatesResponse,
  BwastrLocatorSearchResponse,
  BwastrLocatorService,
} from "./bwastr-locator.service";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";

@UntilDestroy()
@Component({
  selector: "ige-bwastr-spatial",
  templateUrl: "./bwastr-spatial.component.html",
  styleUrls: [
    "../free-spatial/free-spatial.component.scss",
    "./bwastr-spatial.component.scss",
  ],
  standalone: true,
  imports: [
    MatDividerModule,
    MatListModule,
    MatRadioModule,
    SearchInputComponent,
    MatCheckboxModule,
    FormsModule,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
  ],
})
export class BwastrSpatialComponent implements OnInit, OnDestroy {
  @Input() map: Map;
  @Input() value: SpatialLocation;

  @Output() result = new EventEmitter<BwastrSection>();
  @Output() updateTitle = new EventEmitter<string>();

  searchResults: BwastrLocatorSearchResponse[];
  selectedBwastr: BwastrLocatorSearchResponse;

  private _selectedSection: BwastrSection;
  set selectedSection(value: BwastrSection) {
    this._selectedSection = value;
    this.limitForm.setValue({
      start: value.start,
      end: value.end,
    });
  }
  drawnPolyLine: Polyline;

  private bwastrLocatorService = inject(BwastrLocatorService);
  private leafletService = inject(LeafletService);

  searchInput = new UntypedFormControl();
  showWelcome = true;
  showNoResult = false;

  searchSubscribe: Subscription;

  limitForm = new FormGroup({
    start: new FormControl<number>(null, Validators.required),
    end: new FormControl<number>(null, Validators.required),
  });

  ngOnDestroy() {
    this.removeDrawnBwastrSection();
  }

  ngOnInit(): void {
    this.searchInput.valueChanges
      .pipe(untilDestroyed(this), debounceTime(500))
      .subscribe((query) => this.searchLocation(query));

    this.limitForm.valueChanges
      .pipe(untilDestroyed(this), debounceTime(300))
      .subscribe(() => this.updateSection());

    if (this.value.bwastr) {
      this.selectedSection = this.value.bwastr;
    } else {
      this.leafletService.zoomToInitialBox(this.map);
    }
  }

  private searchLocation(query: string) {
    if (this.searchSubscribe) this.searchSubscribe.unsubscribe();

    if (query.trim().length === 0) {
      this.showWelcome = true;
      this.searchResults = [];
      return;
    }
    this.showWelcome = false;

    this.searchSubscribe = this.bwastrLocatorService
      .search(query)
      .subscribe((response: BwastrLocatorSearchResponse[]) => {
        this.searchResults = response;
        this.showNoResult = response.length === 0;
      });
  }

  selectBwastr(entry: BwastrLocatorSearchResponse) {
    this.selectedBwastr = entry;
    this.value.title = entry.concatName;
    this.updateTitle.emit(entry.concatName);

    this.selectedSection = {
      bwastrid: entry.bwastrid,
      start: entry.start,
      end: entry.end,
    };
  }

  private updateSection() {
    if (!this._selectedSection) return;

    this._selectedSection.start = this.limitForm.get("start").value;
    this._selectedSection.end = this.limitForm.get("end").value;

    this.value.bwastr = this._selectedSection;
    this.result.emit(this._selectedSection);
    this.bwastrLocatorService
      .getSectionCoordinates(this._selectedSection)
      .subscribe((response) => {
        if (!response) {
          console.warn(
            "No coordinates found for section! Check backend logs for more information.",
          );
          return;
        }
        this.drawAndZoomBwastrSection(response);
      });
  }

  private drawAndZoomBwastrSection(section: BwastrLocatorCoordinatesResponse) {
    this.removeDrawnBwastrSection();
    const latLngs = section.coordinates.map((singleLine) =>
      singleLine.map((coord) => new LatLng(coord[1], coord[0])),
    );

    this.drawnPolyLine = new Polyline(latLngs, {
      color: "blue",
      weight: 1,
    }).addTo(this.map);

    const bounds = new LatLngBounds(
      new LatLng(section.bounds.lat1, section.bounds.lon1),
      new LatLng(section.bounds.lat2, section.bounds.lon2),
    );
    this.map.fitBounds(bounds);
  }

  private removeDrawnBwastrSection() {
    if (this.drawnPolyLine) {
      const line = this.drawnPolyLine;
      setTimeout(() => this.map.removeLayer(line), 100);
      this.drawnPolyLine = null;
    }
  }
}
