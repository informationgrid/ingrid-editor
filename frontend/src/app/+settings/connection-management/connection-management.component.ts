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
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { FormGroup } from "@angular/forms";
import { ConnectionForm } from "./formly-fields";
import {
  ConfigService,
  ConnectionInfo,
  Connections,
} from "../../services/config/config.service";
import { tap } from "rxjs/operators";

import { FormlyModule } from "@ngx-formly/core";
import { MatButton } from "@angular/material/button";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  ConnectionStateComponent,
  ConnectionStateInfo,
} from "./connection-state/connection-state.component";
import { Subscription } from "rxjs";
import { PageTemplateComponent } from "../../shared/page-template/page-template.component";

@Component({
  selector: "ige-ibus-management",
  templateUrl: "./connection-management.component.html",
  styleUrls: ["./connection-management.component.scss"],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormlyModule,
    MatButton,
    ConnectionStateComponent,
    PageTemplateComponent,
  ],
})
export class ConnectionManagementComponent implements OnInit {
  form = new FormGroup<any>({});
  fields = inject(ConnectionForm).fields;
  model: any;

  $valid = signal<boolean>(false);
  $connectionStates = signal<any[]>([]);
  private connectionSubscriptions: Subscription[];

  constructor(
    private configService: ConfigService,
    private cdr: ChangeDetectorRef,
  ) {
    this.form.statusChanges.pipe(takeUntilDestroyed()).subscribe((state) => {
      this.$valid.set(state === "VALID");
    });
  }

  ngOnInit(): void {
    this.configService
      .getConnectionsConfig()
      .pipe(
        tap((config) => this.checkConnectionState(config.connections)),
        tap((config) => (this.model = config)),
      )
      .subscribe(() => this.cdr.detectChanges());
  }

  save() {
    const config: Connections = this.form.value;
    this.configService.saveConnectionConfig(config).subscribe((response) => {
      this.form.patchValue({ connections: response });
      this.checkConnectionState(response);
    });
  }

  private checkConnectionState(configs: ConnectionInfo[]) {
    this.connectionSubscriptions?.forEach((item) => item.unsubscribe());

    const connectionStates: ConnectionStateInfo[] = configs.map((config) => {
      return {
        id: config.id + "",
        label: config.name,
        connected: undefined,
      };
    });
    this.$connectionStates.set(connectionStates);

    this.connectionSubscriptions = connectionStates.map((config) => {
      return this.configService
        .isConnectionOK(config.id)
        .subscribe((connected) => {
          // in case ibus has been removed during connection check
          config.connected = connected;
          this.$connectionStates.set([...connectionStates]);
        });
    });
  }
}
