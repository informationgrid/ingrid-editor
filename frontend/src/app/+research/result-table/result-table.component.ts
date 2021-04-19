import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ResearchResponse} from '../research.service';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {SelectOption} from '../../services/codelist/codelist.service';
import {ProfileService} from '../../services/profile.service';

@Component({
  selector: 'ige-result-table',
  templateUrl: './result-table.component.html',
  styleUrls: ['./result-table.component.scss']
})
export class ResultTableComponent implements OnInit, AfterViewInit {

  @Input()
  set result(val: ResearchResponse) {
    this.dataSource.data = val?.hits || [];
    this.totalHits = val?.totalHits || 0;
    if (this.displayedColumns.length === 0) {
      setTimeout(() => this.displayedColumns = ['_type', 'title', '_modified', 'settings'], 300);
    }
  };

  @Output() save = new EventEmitter<void>();
  @Output() open = new EventEmitter<string>();
  @Output() remove = new EventEmitter<any>();
  @Output() export = new EventEmitter<string>();

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  dataSource = new MatTableDataSource([]);
  displayedColumns: string[] = [];
  columnsMap: SelectOption[];

  totalHits = 0;
  profileIconsMap: {};

  constructor(private profileService: ProfileService) {
  }

  ngOnInit(): void {
    let profiles = this.profileService.getProfiles();
    this.profileIconsMap = profiles.reduce((acc, val) => {
      acc[val.id] = val.iconClass;
      return acc;
    }, {});
    this.columnsMap = profiles[0].fieldsMap;
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

}
