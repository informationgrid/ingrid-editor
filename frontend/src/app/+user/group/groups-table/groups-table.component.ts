import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { SelectionModel } from "@angular/cdk/collections";
import { Group } from "../../../models/user-group";
import { Subject } from "rxjs";

@Component({
  selector: "groups-table",
  templateUrl: "./groups-table.component.html",
  styleUrls: ["../../user.styles.scss"],
})
export class GroupsTableComponent implements OnInit, AfterViewInit {
  @Input()
  set groups(val: Group[]) {
    if (val) this.isLoading = false;
    this.dataSource.data = val ?? [];
  }

  @Input()
  set query(filter: string) {
    this.dataSource.filter = filter;
  }

  @Input() selectedGroup: Subject<Group>;
  displayedColumns: string[] = ["role-icon", "name", "settings"];
  dataSource = new MatTableDataSource([]);
  selection: SelectionModel<Group>;

  @Output() onGroupSelect = new EventEmitter<Group>();
  @Output() onDelete = new EventEmitter<string>();

  isLoading = true;

  constructor() {
    const initialSelection = [];
    const allowMultiSelect = false;
    this.selection = new SelectionModel<Group>(
      allowMultiSelect,
      initialSelection
    );
    this.dataSource.filterPredicate = (group: Group, filterValue: string) => {
      let searchIn = [group.name ?? "", group.description ?? ""]
        .join(" ")
        .trim()
        .toLowerCase();
      return searchIn.includes(filterValue.trim().toLowerCase());
    };
  }

  ngOnInit() {
    this.selectedGroup.subscribe((group) => {
      this.selection.select(
        this.dataSource.data.find((d) => d.id == group?.id)
      );
      if (this.paginator) {
        const pageNumber = Math.max(
          0,
          Math.floor(
            this.dataSource.data.findIndex((d) => d.id === group?.id) /
              this.paginator.pageSize
          )
        );

        this.paginator.pageIndex = pageNumber;
        this.paginator.page.next({
          pageIndex: pageNumber,
          pageSize: this.paginator.pageSize,
          length: this.paginator.length,
        });
      }
    });
  }

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  trySelect(element) {
    this.selection.select(element);
    this.onGroupSelect.emit(element);
  }
}
