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
      tap((storedMessages) => console.log(`fetched messages`, storedMessages)),
      catchError((e) => {
        const userInfo = this.configService.$userInfo.value;
        console.error("Could not get messages");
        if (userInfo?.assignedCatalogs?.length === 0) {
          console.log("because of user with no assigned catalogs");
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
