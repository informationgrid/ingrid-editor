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
import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { LogResult } from "../index.service";

@Component({
  selector: "ige-log-result",
  templateUrl: "./log-result.component.html",
  styleUrls: ["./log-result.component.scss"],
})
export class LogResultComponent implements OnInit {
  @Input() data: Observable<LogResult>;

  constructor() {}

  ngOnInit(): void {}
}
