/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
  Component,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { FormGroup } from "@angular/forms";
import { ConnectionForm } from "./formly-fields";
import {
  ConfigService,
  Connections,
  GeneralConnectionInfo,
} from "../../services/config/config.service";
import { tap } from "rxjs/operators";

import { MatButton } from "@angular/material/button";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  ConnectionStateComponent,
  ConnectionStateInfo,
} from "./connection-state/connection-state.component";
import { Subscription } from "rxjs";
import { PageTemplateComponent } from "../../shared/page-template/page-template.component";
import { FormlyForm } from "@ngx-formly/core";

@Component({
  selector: "ige-ibus-management",
  templateUrl: "./connection-management.component.html",
  styleUrls: ["./connection-management.component.scss"],
  imports: [
    MatButton,
    ConnectionStateComponent,
    PageTemplateComponent,
    FormlyForm,
  ],
})
export class ConnectionManagementComponent implements OnInit {
  private configService = inject(ConfigService);

  form = new FormGroup<any>({});
  fields = inject(ConnectionForm).fields((model: any) => this.canRemove(model));
  model: any;

  $valid = signal<boolean>(false);
  $connectionStates = signal<any[]>([]);
  $connectionUsage = signal<{ [connectionId: string]: string[] }>({});
  private connectionSubscriptions: Subscription[];

  constructor() {
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
      .subscribe();

    this.configService
      .getConnectionUsage()
      .subscribe((usage) => this.$connectionUsage.set(usage));
  }

  save() {
    const config: Connections = this.form.value;
    this.configService.saveConnectionConfig(config).subscribe((response) => {
      this.form.patchValue({ connections: response });
      this.checkConnectionState(response);
      this.configService
        .getConnectionUsage()
        .subscribe((usage) => this.$connectionUsage.set(usage));
    });
  }

  private checkConnectionState(configs: GeneralConnectionInfo[]) {
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

  private canRemove(model: any): boolean {
    const connectionIsUsed =
      (this.$connectionUsage()[model.id]?.length ?? 0) > 0;
    if (connectionIsUsed) {
      alert(
        "Diese Verbindung kann nicht gelöscht werden, da sie noch in Verwendung ist.",
      );
    }
    return !connectionIsUsed;
  }
}
