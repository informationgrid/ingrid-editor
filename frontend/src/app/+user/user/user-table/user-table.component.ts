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
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { SelectionModel } from "@angular/cdk/collections";
import { Subject } from "rxjs";
import { UserService } from "../../../services/user/user.service";

@Component({
  selector: "user-table",
  templateUrl: "./user-table.component.html",
  styleUrls: ["../../user.styles.scss"],
})
export class UserTableComponent implements OnInit, AfterViewInit {
  @Input() simple = false;

  @Input()
  set users(val: User[]) {
    if (val) this.isLoading = false;
    this.dataSource.data = val ?? [];

    // select previously selected group
    const selectedUser = this.selection.selected[0];
    if (selectedUser) this.setSelectionToUser(selectedUser);
  }

  @Input()
  set query(filter: string) {
    this.dataSource.filter = filter;
  }

  @Input() selectedUser: Subject<User>;

  @Output() onUserSelect = new EventEmitter<User>();

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  displayedColumns: string[];
  dataSource = new MatTableDataSource([]);
  selection: SelectionModel<User>;
  isLoading = true;

  constructor(public userService: UserService) {
    const initialSelection = [];
    const allowMultiSelect = false;
    this.selection = new SelectionModel<User>(
      allowMultiSelect,
      initialSelection
    );
    this.dataSource.filterPredicate = (user: User, filterValue: string) => {
      let searchIn = [
        user.login ?? "",
        user.firstName ?? "",
        user.lastName ?? "",
        user.email ?? "",
        user.organisation ?? "",
      ]
        .join(" ")
        .trim()
        .toLowerCase();
      return searchIn.includes(filterValue.trim().toLowerCase());
    };
  }

  ngOnInit() {
    this.displayedColumns = this.simple
      ? ["role-icon", "firstName"]
      : ["role-icon", "login", "firstName", "organisation"];

    this.selectedUser?.subscribe((user) => {
      this.setSelectionToUser(user);
      this.updatePaginator(user?.login);
    });
  }

  private updatePaginator(id) {
    if (this.paginator) {
      const pageNumber = Math.max(
        0,
        Math.floor(
          this.dataSource.data.findIndex((d) => d.id === id) /
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
  }

  private setSelectionToUser(user: User) {
    this.selection.select(
      this.dataSource.data.find((d) => d.login == user?.login)
    );
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  select(element) {
    this.selection.select(element);
    this.onUserSelect.emit(element);
  }
}
