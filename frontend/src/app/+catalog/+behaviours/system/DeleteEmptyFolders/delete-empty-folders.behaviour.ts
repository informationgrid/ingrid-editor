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
import {
  EventData,
  EventResponseHandler,
  EventService,
  IgeEvent,
  IgeEventResultType,
} from "../../../../services/event/event.service";
import { TreeQuery } from "../../../../store/tree/tree.query";
import { AddressTreeQuery } from "../../../../store/address-tree/address-tree.query";
import { ModalService } from "../../../../services/modal/modal.service";
import { IgeError } from "../../../../models/ige-error";
import { filter, map, take } from "rxjs/operators";
import { Observable } from "rxjs";
import { Plugin } from "../../plugin";
import { PluginService } from "../../../../services/plugin/plugin.service";

@Injectable()
export class DeleteEmptyFoldersBehaviour extends Plugin {
  id = "plugin.delete.empty.folders";
  name = "Nur leere Ordner löschen";
  description = "Es dürfen nur leere Ordner gelöscht werden";
  defaultActive = true;

  constructor(
    private modal: ModalService,
    private eventService: EventService,
    private treeQuery: TreeQuery,
    private addressTreeQuery: AddressTreeQuery,
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

    this.activeDocsWithChildren().subscribe((docsWithChildren) => {
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
    });
  }

  private activeDocsWithChildren(): Observable<String[]> {
    const query = this.forAddress ? this.addressTreeQuery : this.treeQuery;
    // TODO: refactor openedDocument in store to another one, since it's of different format
    //       and not directly associated with tree-store
    return query
      .selectActive()
      .pipe(
        filter((entity) => entity !== undefined),
        take(1),
      )
      .pipe(
        map((docs) => {
          return docs.filter((doc) => doc._hasChildren).map((doc) => doc.title);
        }),
      );
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
