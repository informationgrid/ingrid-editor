/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import {
  EventData,
  EventResponseHandler,
  EventService,
  IgeEvent,
  IgeEventResultType,
} from "../../../../services/event/event.service";
import { ModalService } from "../../../../services/modal/modal.service";
import { IgeError } from "../../../../models/ige-error";
import { Plugin } from "../../plugin";
import { PluginService } from "../../../../services/plugin/plugin.service";
import { TreeStore } from "../../../../store/tree/tree.store";
import { AddressTreeStore } from "../../../../store/address-tree/address-tree.store";

@Injectable()
export class DeleteEmptyFoldersBehaviour extends Plugin {
  id = "plugin.delete.empty.folders";
  name = "Nur leere Ordner löschen";
  description = "Es dürfen nur leere Ordner gelöscht werden";
  defaultActive = true;

  private documentTreeStore = inject(TreeStore);
  private addressTreeStore = inject(AddressTreeStore);

  constructor(
    private modal: ModalService,
    private eventService: EventService,
  ) {
    super();
    inject(PluginService).registerPlugin(this);
  }

  registerForm() {
    super.registerForm();

    this.formSubscriptions.push(
      this.eventService
        .respondToEvent(IgeEvent.DELETE)
        .subscribe((resultObserver) =>
          this.handleEvent(resultObserver.eventResponseHandler),
        ),
    );
  }

  private handleEvent(resultObserver: EventResponseHandler) {
    let success = true;

    const docsWithChildren = this.activeDocsWithChildren();
    if (docsWithChildren?.length) {
      // TODO: improve error generation
      const error = new IgeError();
      error.setMessage(
        "Um Ordner zu löschen, müssen diese leer sein",
        docsWithChildren.join(" , "),
      );
      this.modal.showIgeError(error);
      success = false;
    }
    const responseData = this.buildResponse(success);
    resultObserver(responseData);
  }

  private activeDocsWithChildren(): string[] {
    const store = this.forAddress()
      ? this.addressTreeStore
      : this.documentTreeStore;
    return this.activeNodes()
      .map((item) => store.entityMap()[item])
      .filter((doc) => doc._hasChildren)
      .map((doc) => doc.title);
  }

  private buildResponse(isSuccess: boolean): EventData {
    return {
      result: isSuccess ? IgeEventResultType.SUCCESS : IgeEventResultType.FAIL,
      data: isSuccess
        ? null
        : "this info comes from delete empty folder behaviour",
    };
  }
}
