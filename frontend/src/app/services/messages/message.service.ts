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
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { ConfigService } from "../config/config.service";
import { Message, MessageFormatBackend } from "./message";
import { catchError, tap } from "rxjs/operators";
import { MessagesDataService } from "./messages-data.service";

@Injectable({
  providedIn: "root",
})
export class MessageService {
  messages: Message[] = [];

  messages$ = new BehaviorSubject<Message[]>([]);

  constructor(
    private configService: ConfigService,
    private dataService: MessagesDataService,
  ) {
    this.loadStoredMessages().subscribe((messages) => {
      this.messages = messages;
      this.messages$.next(messages);
    });
  }

  loadStoredMessages(): Observable<Message[]> {
    return this.dataService.loadStoredMessages().pipe(
      tap((storedMessages) =>
        console.debug(`fetched messages`, storedMessages),
      ),
      catchError((e) => {
        const userInfo = this.configService.$userInfo.value;
        console.error("Could not get messages");
        if (userInfo?.assignedCatalogs?.length === 0) {
          console.error("because of user with no assigned catalogs");
          return [];
        } else {
          throw e;
        }
      }),
    );
  }

  getAllMessagesForAdmin(): Observable<MessageFormatBackend[]> {
    return this.dataService.loadAllMessages();
  }

  createMessage(
    message: Message,
    validUntil: Date,
    forCurrentCatalog: boolean,
  ): Observable<any> {
    return this.dataService.createMessage(
      message,
      validUntil,
      forCurrentCatalog,
    );
  }

  deleteMessage(id: Number): Observable<any> {
    return this.dataService.deleteMessage(id);
  }
}
