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
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Map, Rectangle } from "leaflet";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { LeafletService } from "../../leaflet.service";
import { debounceTime, filter, tap } from "rxjs/operators";
import { SpatialBoundingBox } from "../spatial-result.model";

@UntilDestroy()
@Component({
  selector: "ige-coordinates-spatial",
  templateUrl: "./coordinates-spatial.component.html",
  styleUrls: ["./coordinates-spatial.component.scss"],
})
export class CoordinatesSpatialComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  form = new FormGroup({
    lat1: new FormControl<number>(null, Validators.required),
    lon1: new FormControl<number>(null, Validators.required),
    lat2: new FormControl<number>(null, Validators.required),
    lon2: new FormControl<number>(null, Validators.required),
  });

  @Input() map: Map;

  @Input() set coordinates(value: SpatialBoundingBox) {
    if (!value) return;
    this.form.setValue(value, { emitEvent: false });
  }

  @Output() result = new EventEmitter<any>();

  private boundingBoxes: Rectangle[];

  constructor(private leafletService: LeafletService) {}

  ngOnInit(): void {
    this.form.valueChanges
      .pipe(
        untilDestroyed(this),
        debounceTime(300),
        tap((value) => this.removeBoundingBoxes()),
        filter((value) => this.coordinatesValid(value)),
        tap((value) => this.drawCoordinates(value)),
      )
      .subscribe();
  }

  ngAfterViewInit() {
    this.leafletService.zoomToInitialBox(this.map);

    if (this.coordinates) {
      this.drawCoordinates(this.coordinates);
      setTimeout(() => this.result.next(this.coordinates), 50);
    }
  }

  ngOnDestroy() {
    this.removeBoundingBoxes();
  }

  private removeBoundingBoxes() {
    this.leafletService.removeDrawnBoundingBoxes(this.map, this.boundingBoxes);
  }

  private drawCoordinates(values) {
    const coloredBoundingBox = this.leafletService.extendLocationsWithColor([
      {
        title: "",
        type: "free",
        value: <SpatialBoundingBox>values,
      },
    ]);
    this.boundingBoxes = this.leafletService.drawSpatialRefs(
      this.map,
      coloredBoundingBox,
    );
  }

  private coordinatesValid(value): boolean {
    const valid = value.lat1 && value.lon1 && value.lat2 && value.lon2;
    this.result.next(valid ? this.form.value : null);
    return valid;
  }
}
