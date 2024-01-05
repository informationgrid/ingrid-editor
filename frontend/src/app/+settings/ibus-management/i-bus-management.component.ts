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
import { UntypedFormGroup } from "@angular/forms";
import { iBusFields } from "./formly-fields";
import { ConfigService } from "../../services/config/config.service";
import { tap } from "rxjs/operators";

@Component({
  selector: "ige-ibus-management",
  templateUrl: "./i-bus-management.component.html",
  styleUrls: ["./i-bus-management.component.scss"],
})
export class IBusManagementComponent implements OnInit {
  form = new UntypedFormGroup({});
  fields = iBusFields;
  model: any;
  connectionStates = [];

  constructor(private configService: ConfigService) {}

  ngOnInit(): void {
    this.configService
      .getIBusConfig()
      .pipe(tap((config) => this.checkConnectionState(config)))
      .subscribe((config) => (this.model = { ibus: config }));
  }

  save() {
    const config = this.form.value.ibus;
    this.configService
      .saveIBusConfig(config)
      .subscribe(() => this.checkConnectionState(config));
  }

  private checkConnectionState(configs: any[]) {
    this.connectionStates = [];

    configs.forEach((config, index) => {
      this.connectionStates.push({
        id: config.url,
        connected: undefined,
      });
    });

    configs.forEach((config, index) => {
      this.configService
        .isIBusConnected(index)
        .subscribe(
          (connected) => (this.connectionStates[index].connected = connected),
        );
    });
  }
}
