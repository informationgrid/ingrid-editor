import { Component, OnInit } from "@angular/core";
import { UploadCheckService } from "./upload-check.service";
import { tap } from "rxjs/operators";

@Component({
  selector: "ige-upload-check",
  templateUrl: "./upload-check.component.html",
  styleUrls: ["./upload-check.component.scss"],
})
export class UploadCheckComponent implements OnInit {
  private result: any[];
  resultsFiltered: any;
  onlyShowErrors = true;

  constructor(private uploadCheck: UploadCheckService) {}

  ngOnInit(): void {}

  start() {
    this.uploadCheck
      .analyse()
      .pipe(tap((result: any[]) => (this.result = result)))
      .subscribe((result: any[]) => this.filter(this.onlyShowErrors));
  }

  filter(onlyErrors: boolean) {
    this.resultsFiltered = onlyErrors
      ? this.result?.filter((item) => !item.valid)
      : this.result;

    this.resultsFiltered = this.resultsFiltered?.reduce(function (r, a) {
      r[a.catalogId] = r[a.catalogId] || {};
      r[a.catalogId][a.uuid] = r[a.catalogId][a.uuid] || [];
      r[a.catalogId][a.uuid].push(a);
      return r;
    }, Object.create(null));
  }
}
