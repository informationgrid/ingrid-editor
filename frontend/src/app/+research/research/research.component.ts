import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {FacetGroup, ResearchResponse, ResearchService} from './research.service';
import {tap} from 'rxjs/operators';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';

@Component({
  selector: 'ige-research',
  templateUrl: './research.component.html',
  styleUrls: ['./research.component.scss']
})
export class ResearchComponent implements AfterViewInit {

  @ViewChild(MatSort) sort: MatSort;

  filterGroup = this.researchService.getQuickFilter().pipe(tap(filters => this.prepareModel(filters)));

  model: any;
  displayedColumns: string[] = ['title', 'uuid'];

  totalHits: number = 0;
  dataSource = new MatTableDataSource([]);

  constructor(private researchService: ResearchService) {
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  updateFilter() {
    setTimeout(() => {
      return this.researchService.search(this.model)
        .subscribe(result => this.updateHits(result));
    });
  }

  private prepareModel(filters: FacetGroup[]) {
    this.model = {};
    filters.forEach(group => this.model[group.id] = {});
  }

  queryBySQL(sql: string) {
    this.researchService.searchBySQL(sql)
      .subscribe(result => this.updateHits(result));
  }

  private updateHits(result: ResearchResponse) {
    this.totalHits = result.totalHits;
    this.dataSource.data = result.hits;
  }
}
