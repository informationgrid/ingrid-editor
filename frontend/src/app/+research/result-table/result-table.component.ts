import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { ResearchResponse } from "../research.service";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { SelectOptionUi } from "../../services/codelist/codelist.service";
import { ProfileService } from "../../services/profile.service";
import { ProfileQuery } from "../../store/profile/profile.query";
import { IgeDocument } from "../../models/ige-document";

export interface ShortResultInfo {
  uuid: string;
  isAddress: boolean;
}

@Component({
  selector: "ige-result-table",
  templateUrl: "./result-table.component.html",
  styleUrls: ["./result-table.component.scss"],
})
export class ResultTableComponent implements OnInit, AfterViewInit {
  @Input()
  set result(val: ResearchResponse) {
    this.dataSource.data = val?.hits || [];
    this.totalHits = val?.totalHits || 0;
    if (this.displayedColumns.length === 0) {
      setTimeout(
        () =>
          (this.displayedColumns = ["_type", "title", "_modified", "settings"]),
        300
      );
    }
  }

  @Input() isLoading = false;

  @Output() save = new EventEmitter<void>();
  @Output() open = new EventEmitter<ShortResultInfo>();
  @Output() remove = new EventEmitter<IgeDocument>();
  @Output() export = new EventEmitter<string>();

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  dataSource = new MatTableDataSource<IgeDocument>([]);
  displayedColumns: string[] = [];
  columnsMap: SelectOptionUi[];
  showSaveButton: boolean;

  totalHits = 0;
  profileIconsMap: {};

  constructor(
    private profileService: ProfileService,
    private profileQuery: ProfileQuery
  ) {}

  ngOnInit(): void {
    this.profileQuery.selectLoading().subscribe((isLoading) => {
      if (isLoading) return;

      let profiles = this.profileService.getProfiles();
      this.profileIconsMap = profiles.reduce((acc, val) => {
        acc[val.id] = val.iconClass;
        return acc;
      }, {});
      this.columnsMap = profiles[0].fieldsMap;
    });

    this.showSaveButton = this.save.observers.length > 0;
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  openDataset(element: IgeDocument) {
    this.open.emit({
      uuid: element._uuid,
      isAddress: element._category === "address",
    });
  }
}
