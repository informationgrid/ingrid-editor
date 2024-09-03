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
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { Layer, Map } from "leaflet";
import { LeafletService } from "../../leaflet.service";
import { MatDialog } from "@angular/material/dialog";
import { finalize } from "rxjs/operators";
import { TranslocoDirective } from "@ngneat/transloco";
import { MatFormField, MatHint, MatSuffix } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { FocusDirective } from "../../../../../directives/focus.directive";
import { HelpContextButtonComponent } from "../../../../../help-context-button/help-context-button.component";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatButton } from "@angular/material/button";
import { FormErrorComponent } from "../../../../../+form/form-shared/ige-form-error/form-error.component";

@Component({
  selector: "ige-wkt-spatial",
  templateUrl: "./wkt-spatial.component.html",
  styleUrls: ["./wkt-spatial.component.scss"],
  standalone: true,
  imports: [
    TranslocoDirective,
    MatFormField,
    MatInput,
    FocusDirective,
    HelpContextButtonComponent,
    MatSuffix,
    MatProgressSpinner,
    MatButton,
    FormErrorComponent,
    MatHint,
  ],
})
export class WktSpatialComponent implements OnInit, OnDestroy {
  @Input() map: Map;
  @Input() wktString = "";
  @Output() result = new EventEmitter<string>();

  error: string = null;

  private drawnWkt: Layer;
  isAnalyzing = false;

  constructor(
    private leafletService: LeafletService,
    public dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.leafletService.zoomToInitialBox(this.map);

    if (this.wktString) {
      this.drawWkt(this.wktString);
      setTimeout(() => this.result.next(this.wktString), 50);
    }
  }

  ngOnDestroy() {
    this.clearLayer();
  }

  validateWKT(value: string) {
    this.isAnalyzing = true;
    this.clearLayer();
    this.error = null;

    this.leafletService
      .validateWkt(value)
      .pipe(finalize(() => (this.isAnalyzing = false)))
      .subscribe((response) => {
        if (!response.isValid) {
          this.error = response.message;
          this.result.next(null);
          return;
        }

        this.drawWkt(value);
        this.result.next(value);
      });
  }

  private clearLayer() {
    if (this.drawnWkt) {
      this.drawnWkt.remove();
    }
  }

  private drawWkt(value: string) {
    this.drawnWkt = this.leafletService.convertWKT(this.map, value, true);
  }
}
