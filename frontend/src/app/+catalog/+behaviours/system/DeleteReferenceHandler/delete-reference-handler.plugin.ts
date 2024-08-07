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
import { inject, Injectable } from "@angular/core";
import { DocEventsService } from "../../../../services/event/doc-events.service";
import { filter } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import {
  ReplaceAddressDialogComponent,
  ReplaceAddressDialogData,
} from "./replace-address-dialog/replace-address-dialog.component";
import { ConfigService } from "../../../../services/config/config.service";
import { Observable } from "rxjs";
import { AddressTreeQuery } from "../../../../store/address-tree/address-tree.query";
import { FormMenuService } from "../../../../+form/form-menu.service";
import { Plugin } from "../../plugin";
import { PluginService } from "../../../../services/plugin/plugin.service";

@Injectable()
export class DeleteReferenceHandlerPlugin extends Plugin {
  id = "plugin.delete.reference.handler";
  name = "Referenzierte Adressen ersetzen";
  description =
    "Ermöglicht es, alle Referenzen zu einer Adresse mit einer anderen Adresse zu tauschen. Dadurch können alle Referenzen zu einer Adresse entfernt werden, um diese dann löschen zu können.";
  group = "Adressen";
  defaultActive = true;
  forAddress = true;

  constructor(
    private docEvents: DocEventsService,
    private dialog: MatDialog,
    private tree: AddressTreeQuery,
    private docEventsService: DocEventsService,
    private formMenuService: FormMenuService,
    configService: ConfigService,
  ) {
    super();

    if (configService.hasCatAdminRights()) {
      inject(PluginService).registerPlugin(this);
    } else {
      console.debug(
        "DeleteReferenceHandlerPlugin not registered because it's only available for catalog administrators and above.",
      );
    }
  }

  register() {
    super.register();

    const subscription = this.docEvents
      .onError(this.forAddress)
      .pipe(filter((error) => error.errorCode === "IS_REFERENCED_ERROR"))
      .subscribe((error) => {
        const selectedNodes = this.tree.getActive();

        // only supported when one address was selected so far
        if (selectedNodes.length > 1) {
          return;
        }

        error.response.handled = true;

        this.showDialog(selectedNodes[0]._uuid)
          .pipe(filter((response) => response))
          .subscribe(() => this.docEvents.sendEvent({ type: "DELETE" }));
      });

    const onEvent = this.docEvents
      .onEvent("REPLACE_ADDRESS")
      .subscribe((event) => {
        console.log("REPLACE_ADDRESS", event);
        this.showDialog(event.data.uuid, false).subscribe();
      });

    this.subscriptions.push(subscription, onEvent);

    const onDocChange = this.tree.openedDocument$.subscribe((doc) => {
      // refresh menu item
      this.formMenuService.removeMenuItem("address", "replace-address");
      if (doc && doc._type !== "FOLDER") {
        this.formMenuService.addMenuItem("address", {
          title: "Adresse ersetzen",
          name: "replace-address",
          action: () =>
            this.docEventsService.sendEvent({
              type: "REPLACE_ADDRESS",
              data: { uuid: doc._uuid },
            }),
        });
      }
    });
    this.subscriptions.push(onDocChange);
  }

  private showDialog(source: string, showInfo = true): Observable<any> {
    return this.dialog
      .open(ReplaceAddressDialogComponent, {
        data: <ReplaceAddressDialogData>{
          source: source,
          showInfo: showInfo,
        },
      })
      .afterClosed();
  }
}
