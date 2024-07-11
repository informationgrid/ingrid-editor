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
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from "@angular/core";
import { DocumentService } from "../../../../../services/document/document.service";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import {
  PermissionLevel,
  User,
  UserWithDocPermission,
} from "../../../../../+user/user";
import { FormControl } from "@angular/forms";
import { UserTableComponent } from "../../../../../+user/user/user-table/user-table.component";
import { CdkDrag, CdkDragHandle } from "@angular/cdk/drag-drop";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { SharedModule } from "../../../../../shared/shared.module";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

import { MatSnackBar } from "@angular/material/snack-bar";
import { ConfigService } from "../../../../../services/config/config.service";
import { ConfirmDialogComponent } from "../../../../../dialogs/confirm/confirm-dialog.component";
import { MatChip, MatChipListbox } from "@angular/material/chips";
import { noop } from "rxjs";
import { NgForOf } from "@angular/common";
import { DocumentDataService } from "../../../../../services/document/document-data.service";
import { KeywordAnalysis } from "../../../../../../profiles/ingrid/utils/keywords";

export interface ConsolidateDialogData {
  id: number;
}

export interface keywordConsolidateData {
  id: number;
  // status: "unchanged" | "added" | "removed";
}

@Component({
  selector: "consolidate-keywords-dialog",
  templateUrl: "./consolidate-dialog.component.html",
  styleUrls: ["./consolidate-dialog.component.scss"],
  imports: [
    UserTableComponent,
    CdkDrag,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    SharedModule,
    MatProgressSpinnerModule,
    CdkDragHandle,
    MatChip,
    MatChipListbox,
    NgForOf,
  ],
  standalone: true,
})
export class ConsolidateDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConsolidateDialogData,
    private documentService: DocumentService,
    private documentDataService: DocumentDataService,
    private dialogRef: MatDialogRef<ConsolidateDialogComponent>,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    public configService: ConfigService,
    private keywordAnalysis: KeywordAnalysis,
  ) {
    this.id = data.id;
  }

  id: number;
  query = new FormControl<string>("");
  keywords: any[];
  gemetKeywords: any[];
  umthesKeywords: any[];
  freeKeywords: any[];

  gemetKeywordsNew: any[] = [];
  umthesKeywordsNew: any[] = [];
  freeKeywordsNew: any[] = [];
  isLoading: boolean;

  ngOnInit() {
    this.consolidateKeywords(this.keywords);
  }

  private consolidateKeywords(keywords) {
    this.isLoading = true;
    this.documentDataService.load(this.id, false).subscribe((response) => {
      console.log(response.keywords);
      this.gemetKeywords = response.keywords.gemet;
      this.umthesKeywords = response.keywords.umthes;
      this.freeKeywords = response.keywords.free;

      this.keywords = [
        ...this.gemetKeywords,
        ...this.umthesKeywords,
        ...this.freeKeywords,
      ];

      Promise.all([
        ...this.gemetKeywords.map((keyword) =>
          this.keywordAnalysis
            .checkInThesaurus(keyword.label, "gemet")
            .then((res) => {
              console.log(res);
              if (res.found) {
                this.gemetKeywordsNew.push(res);
              }
            }),
        ),
        ...this.umthesKeywords.map((keyword) =>
          this.keywordAnalysis
            .checkInThesaurus(keyword.label, "umthes")
            .then((res) => {
              console.log(res);
              if (res.found !== true) {
                this.umthesKeywordsNew.push(res);
              }
            }),
        ),
        ...this.freeKeywords.map((keyword) =>
          this.keywordAnalysis
            .assignKeyword(keyword.label, true)
            .then((res) => {
              console.log(res);
              if (res.found !== true) {
                this.freeKeywordsNew.push(res);
              }
            }),
        ),
      ]).then(() => {
        // Set loading flag to false once all keywords are processed
        this.isLoading = false;
        console.log(this.gemetKeywordsNew);
        console.log(this.umthesKeywordsNew);
        console.log(this.freeKeywordsNew);
      });
      return this.keywords;
    });
  }
}
