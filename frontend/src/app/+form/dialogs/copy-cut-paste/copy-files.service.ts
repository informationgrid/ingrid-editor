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
import { Injectable, WritableSignal } from "@angular/core";
import { SnackBarMessageService } from "../../form-shared/updatable-snackbar/snackbar-message.service";
import { ConfigService } from "../../../services/config/config.service";

interface CopyFilesMessage {
  catalogId: string;
  sourceDatasetId: string;
  targetDatasetId: string;
  targetDatasetTitle: string;
  jobId: string;
  copiedFiles: number;
  totalFiles: number;
  progress: number;
}

@Injectable({
  providedIn: "root",
})
export class CopyFilesService extends SnackBarMessageService {
  status: WritableSignal<CopyFilesMessage>;

  private jobs: Map<string, CopyFilesMessage> = new Map();

  protected onMessage(data: CopyFilesMessage): boolean {
    if (!data?.jobId) {
      // fallback to single-job behavior
      return super.onMessage(data);
    }

    // update or add job
    this.jobs.set(data.jobId, data);

    // remove finished jobs
    if (data.progress >= 100) {
      this.jobs.delete(data.jobId);
    }

    // build a concise message for all active jobs
    if (this.jobs.size === 0) {
      this.message.set(`Kopieren der Dateien abgeschlossen`);
    } else if (this.jobs.size === 1) {
      const only = Array.from(this.jobs.values())[0];
      this.message.set(
        `Kopiere Dateien nach "${only.targetDatasetTitle || only.targetDatasetId}": ${only.copiedFiles}/${only.totalFiles} (${only.progress}%)`,
      );
    } else {
      const parts: string[] = [];
      this.jobs.forEach((j) =>
        parts.push(
          `${j.targetDatasetTitle || j.targetDatasetId}: ${j.copiedFiles}/${j.totalFiles} (${j.progress}%)`,
        ),
      );
      this.message.set(
        `Mehrere Kopiervorgänge (${this.jobs.size}): <ul><li>${parts.join("</li><li>")}</li></ul>`,
      );
    }

    // all done when no active jobs left
    return this.jobs.size === 0;
  }

  protected updateMessage(data: CopyFilesMessage) {
    // kept for fallback behavior
    this.message.set(
      `Dateikopierfortschritt: ${data.copiedFiles}/${data.totalFiles} (${data.progress}%)`,
    );
  }

  isCopyInProgress(targetId: string) {
    // check if any active job targets this dataset
    for (const j of this.jobs.values()) {
      if (j.targetDatasetId === targetId && j.progress < 100) return true;
    }
    return false;
  }

  protected isDone() {
    // single-job fallback
    return this.status()?.progress >= 100;
  }

  protected getWatchPath() {
    return `/topic/copyFilesStatus/${ConfigService.catalogId}`;
  }
}
