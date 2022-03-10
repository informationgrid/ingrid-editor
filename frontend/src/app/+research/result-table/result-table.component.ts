import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { ResearchResponse, ResearchService } from "../research.service";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort, Sort } from "@angular/material/sort";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { SelectOptionUi } from "../../services/codelist/codelist.service";
import { ProfileService } from "../../services/profile.service";
import { ProfileQuery } from "../../store/profile/profile.query";
import { IgeDocument } from "../../models/ige-document";
import { QueryQuery } from "../../store/query/query.query";

export interface ShortResultInfo {
  uuid: string;
  isAddress: boolean;
}

@Component({
  selector: "ige-result-table",
  templateUrl: "./result-table.component.html",
  styleUrls: ["./result-table.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultTableComponent implements OnInit, AfterViewInit {
  @Input() set result(val: ResearchResponse) {
    this.updateTableFromResponse(val);
  }

  @Input() isLoading = false;
  @Input() pageIndex = 0;

  @Output() save = new EventEmitter<void>();
  @Output() open = new EventEmitter<ShortResultInfo>();
  @Output() remove = new EventEmitter<IgeDocument>();
  @Output() export = new EventEmitter<string>();

  @ViewChild(MatSort) sort: MatSort;

  @ViewChild(MatPaginator, { static: false })
  set paginator(value: MatPaginator) {
    if (this.dataSource) {
      this.dataSource.paginator = value;
    }
  }

  dataSource = new MatTableDataSource<IgeDocument>([]);
  displayedColumns: string[] = [];
  columnsMap: SelectOptionUi[];
  showSaveButton: boolean;

  totalHits = 0;
  profileIconsMap: {};

  constructor(
    private profileService: ProfileService,
    private profileQuery: ProfileQuery,
    private researchService: ResearchService
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

  updatePageInStore($event: PageEvent) {
    this.researchService.updateUIState({ page: $event.pageIndex });
  }

  private updateTableFromResponse(val: ResearchResponse) {
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

  updateSortInStore($event: Sort) {
    this.researchService.updateUIState({
      sort: { column: $event.active, direction: $event.direction },
    });
  }
}
