/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import { Component, OnInit } from "@angular/core";
import { UploadCheckService } from "./upload-check.service";
import { tap } from "rxjs/operators";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { KeyValuePipe } from "@angular/common";
import { RouterLink } from "@angular/router";
import { MatButton } from "@angular/material/button";

@Component({
  selector: "ige-upload-check",
  templateUrl: "./upload-check.component.html",
  styleUrls: ["./upload-check.component.scss"],
  standalone: true,
  imports: [MatCheckboxModule, KeyValuePipe, RouterLink, MatButton],
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
      .subscribe(() => this.filter(this.onlyShowErrors));
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
