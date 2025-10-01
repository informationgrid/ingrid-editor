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
import { Injectable, WritableSignal } from "@angular/core";
import { UntilDestroy } from "@ngneat/until-destroy";
import { SnackBarMessageService } from "../../form-shared/updatable-snackbar/snackbar-message.service";
import { ConfigService } from "../../../services/config/config.service";

interface CopyFilesMessage {
  catalogId: string;
  sourceDatasetId: string;
  targetDatasetId: string;
  copiedFiles: number;
  totalFiles: number;
  progress: number;
}

@UntilDestroy()
@Injectable({
  providedIn: "root",
})
export class CopyFilesService extends SnackBarMessageService {
  status: WritableSignal<CopyFilesMessage>;

  protected updateMessage(data: CopyFilesMessage) {
    this.message.set(
      `Dateikopierfortschritt: ${data.copiedFiles}/${data.totalFiles} (${data.progress}%)`,
    );
  }

  isCopyInProgress(targetId) {
    return this.status()?.targetDatasetId == targetId && !this.isDone();
  }

  protected isDone() {
    return this.status()?.progress >= 100;
  }

  protected getWatchPath() {
    return `/topic/copyFilesStatus/${ConfigService.catalogId}`;
  }
}
