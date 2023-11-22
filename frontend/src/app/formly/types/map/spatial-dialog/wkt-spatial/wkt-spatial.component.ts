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

@Component({
  selector: "ige-wkt-spatial",
  templateUrl: "./wkt-spatial.component.html",
  styleUrls: ["./wkt-spatial.component.scss"],
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
