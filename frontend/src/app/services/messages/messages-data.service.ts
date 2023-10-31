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
