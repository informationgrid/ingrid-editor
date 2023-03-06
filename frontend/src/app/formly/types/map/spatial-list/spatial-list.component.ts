import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { SpatialBoundingBox } from "../spatial-dialog/spatial-result.model";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { Observable } from "rxjs";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../../../dialogs/confirm/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";

export type SpatialLocationType = "free" | "wkt" | "coordinates" | "geo-name";

export interface SpatialLocation {
  title: string;
  type: SpatialLocationType;
  value?: SpatialBoundingBox;
  wkt?: string;
  limitTypes?: SpatialLocationType[];
}

export interface SpatialLocationWithColor extends SpatialLocation {
  indexNumber: number;
  color: string;
}

@UntilDestroy()
@Component({
  selector: "ige-spatial-list",
  templateUrl: "./spatial-list.component.html",
  styleUrls: ["./spatial-list.component.scss"],
})
export class SpatialListComponent implements OnInit {
  @Input() locations: Observable<SpatialLocationWithColor[]>;
  @Input() disabled = false;

  @Output() selectLocation = new EventEmitter<number>();
  @Output() edit = new EventEmitter<number>();
  @Output() remove = new EventEmitter<number>();

  typedLocations: { [x: string]: SpatialLocationWithColor[] };
  types: SpatialLocationType[];

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.locations
      .pipe(untilDestroyed(this))
      .subscribe((locations) => this.updateLocations(locations));
  }

  private updateLocations(locations: SpatialLocationWithColor[]): void {
    this.typedLocations = locations.reduce(
      (prev, curr) => {
        prev[curr.type].push(curr);
        return prev;
      },
      { free: [], wkt: [], coordinates: [], "geo-name": [] }
    );

    // @ts-ignore
    this.types = Object.keys(this.typedLocations).filter(
      (type) => this.typedLocations[type].length > 0
    );
  }

  getTypeName(type: SpatialLocationType): string {
    switch (type) {
      case "free":
        return "Freier Raumbezug";
      case "wkt":
        return "Raumbezug (WKT)";
      case "coordinates":
        return "Koordinaten";
      case "geo-name":
        return "Geographischer Name";
    }
  }

  confirmRemove(location: SpatialLocationWithColor): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: "Raumbezug löschen",
          message: "Möchten Sie wirklich diesen Raumbezug löschen?",
          list: location.title ? [location.title] : undefined,
        } as ConfirmDialogData,
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.remove.next(location.indexNumber);
        }
      });
  }
}
