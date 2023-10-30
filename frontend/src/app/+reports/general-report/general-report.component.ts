import {
  Component,
  EventEmitter,
  OnInit,
  signal,
  ViewChild,
} from "@angular/core";
import { DocumentService } from "../../services/document/document.service";
import { firstValueFrom } from "rxjs";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { StatisticResponse } from "../../models/statistic.model";
import { Facets, ResearchService } from "../../+research/research.service";
import { UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import { debounceTime, startWith, tap } from "rxjs/operators";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { ProfileService } from "../../services/profile.service";

@UntilDestroy()
@Component({
  selector: "ige-general-report",
  templateUrl: "./general-report.component.html",
  styleUrls: ["./general-report.component.scss"],
})
export class GeneralReportComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  chartDataPublished = signal<number[]>(null);
  ignoredTypes = ["FOLDER"];

  displayedColumns = [
    "icon",
    "title",
    "percentage",
    "count",
    "published",
    "working",
  ];

  facetModel: any;
  facetViewRefresher = new EventEmitter<void>();
  dataSource = new MatTableDataSource([]);

  form = new UntypedFormGroup({
    type: new UntypedFormControl("selectDocuments"),
    facets: new UntypedFormControl(),
  });
  facets: Facets;

  constructor(
    private docService: DocumentService,
    private profileService: ProfileService,
    private researchService: ResearchService,
  ) {}

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  async ngOnInit() {
    await this.initFacets();
    this.form.valueChanges
      .pipe(untilDestroyed(this), startWith(""), debounceTime(300))
      .subscribe(() => this.updateFilter());
  }

  updateFilter() {
    return this.researchService
      .searchStatistic({
        type: this.form.value.type,
        ...this.form.value.facets,
      })
      .subscribe((result) => this.prepareTableData(result));
  }

  prepareTableData(response: StatisticResponse) {
    var data = [];
    var filteredTotal = 0;
    var filteredDrafts = 0;
    var filteredPublished = 0;
    Object.keys(response.statsPerType).forEach((type) => {
      if (!this.ignoredTypes.includes(type)) {
        filteredTotal += response.statsPerType[type].totalNum;
        filteredDrafts += response.statsPerType[type].numPublished;
        filteredPublished += response.statsPerType[type].numDrafts;
      }
    });
    Object.keys(response.statsPerType).forEach((type) => {
      if (this.ignoredTypes.includes(type)) return;
      const stats = response.statsPerType[type];
      let entry: any = {
        icon: this.getIcon(type) ?? type,
        title: type,
        percentage:
          filteredTotal > 0
            ? Math.round((stats.totalNum / filteredTotal) * 100)
            : 0,
        count: stats.totalNum,
        published: stats.numPublished,
        working: stats.numDrafts,
      };
      entry = { ...entry, ariaLabel: this.getAriaLabelForRow(entry) };
      data.push(entry);
    });

    this.dataSource.data = data;
    this.chartDataPublished.set([filteredPublished, filteredDrafts]);
  }

  getIcon(type: string): string {
    return this.profileService.getProfile(type)?.iconClass ?? "";
  }

  getTitle(type: string): string {
    return this.profileService.getProfile(type)?.label ?? type;
  }

  private async initFacets() {
    return firstValueFrom(
      this.researchService
        .getQuickFilter()
        .pipe(tap((filters) => (this.facets = filters))),
    );
  }

  getAriaLabelForRow(entry) {
    return `Typ: ${this.getTitle(entry.title)}, Prozent: ${
      entry.percentage
    }%, Anzahl: ${entry.count}, davon veröffentlicht: ${
      entry.published
    }, in Bearbeitung: ${entry.working}`;
  }
}
