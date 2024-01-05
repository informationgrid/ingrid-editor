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
import { Observable } from "rxjs";
import { ConfigService, Configuration } from "../config/config.service";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Message, MessageFormatBackend } from "./message";

@Injectable({
  providedIn: "root",
})
export class MessagesDataService {
  private configuration: Configuration;

  constructor(
    private http: HttpClient,
    configService: ConfigService,
  ) {
    this.configuration = configService.getConfiguration();
  }

  loadStoredMessages(): Observable<Message[]> {
    return this.http.get<Message[]>(this.configuration.backendUrl + "messages");
  }

  loadAllMessages(): Observable<MessageFormatBackend[]> {
    return this.http.get<MessageFormatBackend[]>(
      this.configuration.backendUrl + "dbMessages",
    );
  }

  createMessage(
    message: Message,
    validUntil: Date,
    forCurrentCatalog: boolean,
  ) {
    return this.http.post(this.configuration.backendUrl + "messages", {
      message,
      validUntil: validUntil,
      forCurrentCatalog,
    });
  }

  deleteMessage(id: Number) {
    return this.http.delete(this.configuration.backendUrl + "messages/" + id);
  }
}
