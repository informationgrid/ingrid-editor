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
import { filter } from "rxjs/operators";
import { GeneralTable } from "../../general.table";

@Component({
  selector: "user-table",
  templateUrl: "./user-table.component.html",
  styleUrls: ["../../table.styles.scss"],
})
export class UserTableComponent
  extends GeneralTable
  implements OnInit, AfterViewInit
{
  @Input() simple = false;

  @Input()
  set users(val: User[]) {
    if (val) this.isLoading = false;
    this.dataSource.data = val ?? [];

    // select previously selected group
    const selectedUser = this.selection.selected[0];
    if (selectedUser) this.setSelectionToItem(selectedUser?.login, "login");
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
  dataSource = new MatTableDataSource<User>([]);
  selection: SelectionModel<User>;

  constructor(public userService: UserService) {
    super();
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

    this.updateUserOnSelectionBehaviour();
  }

  private updateUserOnSelectionBehaviour() {
    if (!this.selectedUser) return;

    this.selectedUser
      .pipe(filter((user) => this.selection.selected[0]?.login !== user?.login))
      .subscribe((user) => {
        this.setSelectionToItem(user?.login, "login");
        this.updatePaginator(user?.login, "login");
      });
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
