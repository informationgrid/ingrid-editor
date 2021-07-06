import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { User } from "../../user";
import { FormControl } from "@angular/forms";
import { MatSort, Sort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { SelectionModel } from "@angular/cdk/collections";

@Component({
  selector: "user-table",
  templateUrl: "./user-table.component.html",
  styleUrls: ["../../user.styles.scss"],
})
export class UserTableComponent implements OnInit, AfterViewInit {
  @Input()
  set users(val: User[]) {
    this.dataSource.data = val ?? [];
  }

  @Input()
  set query(filter: string) {
    this.dataSource.filter = filter;
  }

  @Input() selectedUser: User;
  @Input() selectedUserForm: FormControl;
  displayedColumns: string[] = [
    "role-icon",
    "login",
    "firstName",
    "organisation",
  ];
  dataSource = new MatTableDataSource([]);
  selection: SelectionModel<User>;

  @Output() onUserSelect = new EventEmitter<User>();

  constructor() {
    const initialSelection = [];
    const allowMultiSelect = false;
    this.selection = new SelectionModel<User>(
      allowMultiSelect,
      initialSelection
    );
    this.selection.changed.subscribe((selection) => {
      this.onUserSelect.emit(selection.source.selected[0]);
    });
    this.dataSource.filterPredicate = (user: User, filterValue: string) => {
      let searchIn =
        (user.login ?? "") +
        (user.firstName ?? "") +
        (user.lastName ?? "") +
        (user.email ?? "") +
        (user.organisation ?? "").trim().toLowerCase();
      return searchIn.includes(filterValue.trim().toLowerCase());
    };
  }

  ngOnInit() {}

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  sortedData: User[];

  sortData(sort: Sort) {
    const data = this.dataSource.data.slice();
    if (!sort.active || sort.direction === "") {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === "asc";
      switch (sort.active) {
        case "login":
          return compare(a.login, b.login, isAsc);
        case "organisation":
          console.log(a.firstName, b.firstName);
          return compare(a.login, b.login, isAsc);
        default:
          return 0;
      }

      function compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
      }
    });
  }

  getRoleIcon(role: string) {
    switch (true) {
      case role === "ige-super-admin":
      case role === "cat-admin":
        return "catalog-admin";
      case role.includes("admin"):
        return "meta-admin";
      default:
        return "author";
    }
  }
}
