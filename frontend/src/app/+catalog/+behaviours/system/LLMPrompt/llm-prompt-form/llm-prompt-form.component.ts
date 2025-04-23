import { Component, inject, signal } from "@angular/core";
import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from "@angular/common/http";
import { NgClass } from "@angular/common";
import { catchError, finalize } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { FormStateService } from "../../../../../+form/form-state.service";
import { MarkdownModule } from 'ngx-markdown';

interface LLMRequest {
  message: string;
}

interface LLMResponse {
  content: string;
  timestamp: string;
}

interface Message {
  id: string;
  text: string;
  fromUser: boolean;
  generating: boolean;
  timestamp?: string;
}

@Component({
  selector: "llm-prompt-form",
  templateUrl: './llm-prompt-form.component.html',
  styleUrls: ["./llm-prompt-form.component.scss"],
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FormsModule,
    NgClass,
    MarkdownModule,
  ],
  providers: [
  ]
})
export class LLMPromptFormComponent {
  private readonly http = inject(HttpClient);
  private readonly _messages = signal<Message[]>([]);
  private readonly _generatingInProgress = signal<boolean>(false);

  readonly messages = this._messages.asReadonly();
  readonly generatingInProgress = this._generatingInProgress.asReadonly();

  constructor(
    private formStateService: FormStateService,
) {
  }

  sendMessage(form: NgForm, messageText: string): void {
    if (!messageText?.trim()) return;

    this._generatingInProgress.set(true);

    const currentDoc = JSON.stringify(this.formStateService.getForm().value);

    // Add user message to the list
    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: messageText,
      fromUser: true,
      generating: false,
      timestamp: new Date().toISOString()
    };
    this._messages.update(msgs => [...msgs, userMessage]);

    const promptMessage = " Du bist ein hilfreicher Assistent mit spezieller Kenntnis im Bereich Metadaten. Du kennst die ISO 19139, ISO 19115 und ISO 19119 und DCAT-AP. " +
      "Du betrachtest die Metadaten in der folgenden JSON Struktur und beantwortest Fragen dazu.\n\n JSON:\n" + currentDoc + "\n\n Fragen:\n" + messageText;

    console.log(promptMessage);

    // Prepare request payload
    const request: LLMRequest = {
      message: promptMessage
    };

    // Call backend API with POST and proper request/response types
    this.http.post<LLMResponse>('/api/llm/message', request)
      .pipe(
        catchError(error => {
          console.error('Error calling LLM API:', error);
          const errorMessage: Message = {
            id: crypto.randomUUID(),
            text: 'Sorry, there was an error processing your request.',
            fromUser: false,
            generating: false,
            timestamp: new Date().toISOString()
          };
          this._messages.update(msgs => [...msgs, errorMessage]);
          return throwError(() => error);
        }),
        finalize(() => {
          this._generatingInProgress.set(false);
        })
      )
      .subscribe({
        next: (response) => {
          const aiMessage: Message = {
            id: crypto.randomUUID(),
            text: response.content,
            fromUser: false,
            generating: false,
            timestamp: response.timestamp
          };
          this._messages.update(msgs => [...msgs, aiMessage]);
        }
      });

    form.resetForm();
  }
}
