import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FormControl} from "@angular/forms";
import {MatSort, Sort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {SelectionModel} from "@angular/cdk/collections";
import {Group} from "../../../models/user-group";

@Component({
  selector: 'groups-table',
  templateUrl: './groups-table.component.html',
  styleUrls: ['./groups-table.component.scss'],
})
export class GroupsTableComponent implements OnInit, AfterViewInit {

  @Input()
  set groups(val: Group[]) {
    this.dataSource.data = val ?? [];
  }

  @Input()
  set query(filter: string) {
    this.dataSource.filter = filter;
  }

  @Input() selectedGroup: Group;
  @Input() selectedGroupForm: FormControl;
  displayedColumns: string[] = ['role-icon', 'name', 'settings'];
  dataSource = new MatTableDataSource([]);
  private selection: SelectionModel<Group>;

  @Output()
  onGroupSelect = new EventEmitter<Group>();


  constructor() {
    const initialSelection = [];
    const allowMultiSelect = false;
    this.selection = new SelectionModel<Group>(allowMultiSelect, initialSelection);
    this.selection.changed.subscribe(selection => {
      this.onGroupSelect.emit(selection.source.selected[0])
    })
  }

  ngOnInit() {
  }

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  sortedData: Group[];

  sortData(sort: Sort) {
    const data = this.dataSource.data.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'login':
          return compare(a.login, b.login, isAsc);
        case 'organisation':
          console.log(a.firstName, b.firstName)
          return compare(a.login, b.login, isAsc);
        default:
          return 0;
      }

      function compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
      }
    });

  }
}
