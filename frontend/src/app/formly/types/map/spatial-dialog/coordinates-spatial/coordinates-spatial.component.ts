import {
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
export class CoordinatesSpatialComponent implements OnInit, OnDestroy {
  @Input() map: Map;
  @Input() coordinates: SpatialBoundingBox;
  @Output() result = new EventEmitter<any>();

  form: FormGroup;

  private boundingBoxes: Rectangle[];

  constructor(private leafletService: LeafletService) {}

  ngOnInit(): void {
    this.leafletService.zoomToInitialBox(this.map);

    this.form = new FormGroup({
      lat1: new FormControl<number>(
        this.coordinates?.lat1,
        Validators.required
      ),
      lon1: new FormControl<number>(
        this.coordinates?.lon1,
        Validators.required
      ),
      lat2: new FormControl<number>(
        this.coordinates?.lat2,
        Validators.required
      ),
      lon2: new FormControl<number>(
        this.coordinates?.lon2,
        Validators.required
      ),
    });

    if (this.coordinates) {
      this.drawCoordinates(this.coordinates);
      setTimeout(() => this.result.next(this.coordinates), 50);
    }

    this.form.valueChanges
      .pipe(
        untilDestroyed(this),
        debounceTime(300),
        tap((value) => this.removeBoundingBoxes()),
        filter((value) => this.coordinatesValid(value)),
        tap((value) => this.drawCoordinates(value))
      )
      .subscribe();
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
        type: "coordinates",
        value: <SpatialBoundingBox>values,
      },
    ]);
    this.boundingBoxes = this.leafletService.drawSpatialRefs(
      this.map,
      coloredBoundingBox
    );
  }

  private coordinatesValid(value): boolean {
    const valid = value.lat1 && value.lon1 && value.lat2 && value.lon2;
    this.result.next(valid ? this.form.value : null);
    return valid;
  }
}
