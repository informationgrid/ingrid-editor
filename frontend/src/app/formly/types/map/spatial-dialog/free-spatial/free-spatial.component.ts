import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {debounceTime} from 'rxjs/operators';
import {NominatimResult, NominatimService} from '../../nominatim.service';
import {MatSelectionListChange} from '@angular/material/list';
import {SpatialResult} from '../spatial-result.model';

@UntilDestroy()
@Component({
  selector: 'ige-free-spatial',
  templateUrl: './free-spatial.component.html',
  styleUrls: ['./free-spatial.component.scss']
})
export class FreeSpatialComponent implements OnInit {

  @Output() boundingBox = new EventEmitter<SpatialResult>();

  nominatimResult: NominatimResult[] = [];
  searchInput = new FormControl();
  showNoResult = false;
  showWelcome = true;

  constructor(private nominatimService: NominatimService) {
  }

  ngOnInit(): void {

    this.searchInput.valueChanges
      .pipe(
        untilDestroyed(this),
        debounceTime(500)
      )
      .subscribe(query => this.searchLocation(query));

  }

  searchLocation(query: string) {

    if (query.trim().length === 0) {
      this.showWelcome = true;
      this.nominatimResult = [];
      return;
    }
    this.showWelcome = false;

    this.nominatimService.search(query).subscribe((response: NominatimResult[]) => {
      this.nominatimResult = response;
      console.log('Nominatim:', response);
      this.showNoResult = response.length === 0;
      // setTimeout(() => (<MyMap>this.leafletReference)._onResize());
    });

  }

  handleSelection(event: MatSelectionListChange) {

    if (event.option.selected) {
      event.source.deselectAll();
      event.option._setSelected(true);
    }

    const item: NominatimResult = event.option.value;
    this.boundingBox.next({
      title: item.display_name,
      box: item.boundingbox
    });

  }

}
