import { Component, inject, OnInit } from "@angular/core";
import { MatDividerModule } from "@angular/material/divider";
import { MatListModule } from "@angular/material/list";
import { MatRadioModule } from "@angular/material/radio";
import { NgForOf, NgIf } from "@angular/common";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { debounceTime } from "rxjs/operators";
import { UntypedFormControl } from "@angular/forms";
import { NominatimResult } from "../../nominatim.service";
import { Map } from "leaflet";
import { Subscription } from "rxjs";
import { GeothesaurusWfsGndeService } from "./geothesaurus-wfs-gnde.service";
import { SearchInputComponent } from "../../../../../shared/search-input/search-input.component";

interface GeoThesaurusResult {}

@UntilDestroy()
@Component({
  selector: "ige-geothesaurus-wfsgnde",
  templateUrl: "./geothesaurus-wfsgnde.component.html",
  styleUrls: ["./geothesaurus-wfsgnde.component.scss"],
  standalone: true,
  imports: [
    MatDividerModule,
    MatListModule,
    MatRadioModule,
    NgForOf,
    NgIf,
    SearchInputComponent,
  ],
})
export class GeothesaurusWfsgndeComponent implements OnInit {
  searchInput = new UntypedFormControl();
  showWelcome = true;
  showNoResult = false;
  nominatimResult: GeoThesaurusResult[] = [];
  searchSubscribe: Subscription;

  private thesaurus = inject(GeothesaurusWfsGndeService);

  ngOnInit(): void {
    this.searchInput.valueChanges
      .pipe(untilDestroyed(this), debounceTime(500))
      .subscribe((query) => this.searchLocation(query));

    /*if (!this.drawnBBox) {
      this.leafletService.zoomToInitialBox(this.map);
    }*/
  }

  private searchLocation(query: string) {
    if (query.trim().length === 0) {
      this.showWelcome = true;
      this.nominatimResult = [];
      return;
    }
    this.showWelcome = false;

    this.searchSubscribe = this.thesaurus
      .search(query)
      .subscribe((response: NominatimResult[]) => {
        response = response.filter((item) => item.type !== "city");
        // .map((item) => FreeSpatialComponent.addTypeToDisplayName(item));
        this.nominatimResult = response;
        console.log("Nominatim:", response);
        this.showNoResult = response.length === 0;
        // @ts-ignore
        setTimeout(() => (<Map>this.map)._onResize());
      });
  }
}
