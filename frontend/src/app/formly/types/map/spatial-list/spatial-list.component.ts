/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from "@angular/core";
import { SpatialBoundingBox } from "../spatial-dialog/spatial-result.model";
import { UntilDestroy } from "@ngneat/until-destroy";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../../../dialogs/confirm/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatLine } from "@angular/material/core";
import { MatIconButton } from "@angular/material/button";
import { MatTooltip } from "@angular/material/tooltip";
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";
import { DecimalPipe } from "@angular/common";

export type SpatialLocationType = "free" | "wkt" | "wfsgnde" | "bwastr";

export interface SpatialDialogData {
  location: SpatialLocation;
  limitTypes?: SpatialLocationType[];
}

export interface SpatialLocation {
  title: string;
  type: SpatialLocationType;
  value?: SpatialBoundingBox;
  wkt?: string;
  ars?: string;
  bwastr?: BwastrSection;
}

export type BwastrSection = {
  bwastrid: string;
  bwastr_name: string;
  strecken_name: string;
  concat_name: string;
  start?: number;
  end?: number;
};

export interface SpatialLocationWithColor extends SpatialLocation {
  indexNumber: number;
  color: string;
}

@UntilDestroy()
@Component({
  selector: "ige-spatial-list",
  templateUrl: "./spatial-list.component.html",
  styleUrls: ["./spatial-list.component.scss"],
  imports: [
    MatIcon,
    TranslocoDirective,
    MatLine,
    MatIconButton,
    MatTooltip,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    DecimalPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpatialListComponent {
  readonly locations = input<SpatialLocationWithColor[]>([]);
  readonly disabled = input<boolean>(false);

  readonly selectLocation = output<number>();
  readonly edit = output<number>();
  readonly remove = output<number>();

  private dialog = inject(MatDialog);

  typedLocations = computed<{ [x: string]: SpatialLocationWithColor[] }>(() => {
    return this.locations().reduce(
      (prev, curr) => {
        prev[curr.type].push(curr);
        return prev;
      },
      { free: [], wkt: [], coordinates: [], wfsgnde: [], bwastr: [] },
    );
  });
  types = computed<string[]>(() => {
    return Object.keys(this.typedLocations()).filter(
      (type) => this.typedLocations()[type].length > 0,
    );
  });

  confirmRemove(location: SpatialLocationWithColor): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: "Raumbezug löschen",
          message: "Möchten Sie wirklich diesen Raumbezug löschen?",
          list: location.title ? [location.title] : undefined,
        } as ConfirmDialogData,
        delayFocusTrap: true,
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.remove.emit(location.indexNumber);
        }
      });
  }
}
