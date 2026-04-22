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
import { AfterViewInit, Component, signal, viewChild } from "@angular/core";
import { MatButton, MatIconButton } from "@angular/material/button";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource,
} from "@angular/material/table";
import { MatIcon } from "@angular/material/icon";
import { MatSort, MatSortHeader } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { MatTooltip } from "@angular/material/tooltip";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";
import { ComparisonDialogComponent } from "./comparison-dialog/comparison-dialog.component";
import { MatBadge } from "@angular/material/badge";
import { MatDivider } from "@angular/material/list";
import { PageTemplateComponent } from "../../shared/page-template/page-template.component";
import { ScoreIndicatorComponent } from "../../shared/score-indicator/score-indicator.component";
import { HintLoadingViewComponent } from "../../shared/hint-loading-view/hint-loading-view.component";
import {
  AiAssistantService,
  EvaluationResult,
} from "../../services/ai-assistant/ai-assistant.service";
import { ConfigService } from "../../services/config/config.service";

@Component({
  selector: "ige-tab-quality-analysis",
  templateUrl: "./tab-quality-analysis.component.html",
  styleUrls: ["./tab-quality-analysis.component.scss"],
  imports: [
    PageTemplateComponent,
    MatButton,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatHeaderCellDef,
    MatCellDef,
    MatHeaderRow,
    MatRow,
    MatHeaderRowDef,
    MatRowDef,
    MatIconButton,
    MatIcon,
    MatSort,
    MatSortHeader,
    MatPaginator,
    ScoreIndicatorComponent,
    MatTooltip,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatBadge,
    MatDivider,
    HintLoadingViewComponent,
  ],
})
export class TabQualityAnalysisComponent implements AfterViewInit {
  displayedColumns: string[] = [
    "totalSuggestionCount",
    "title",
    "totalScore",
    "settings",
  ];
  dataSource = new MatTableDataSource<EvaluationResult>([]);

  readonly sort = viewChild(MatSort);
  readonly paginator = viewChild(MatPaginator);

  isLoading = signal<boolean>(false);
  loadingHints = [
    "Datensätze werden gerade analysiert...",
    "Bitte haben Sie etwas Geduld...",
  ];

  constructor(
    private router: Router,
    private aiService: AiAssistantService,
    private dialog: MatDialog,
  ) {}

  ngAfterViewInit() {
    this.dataSource.sort = this.sort();
    this.dataSource.paginator = this.paginator();
  }

  startAnalysis() {
    this.isLoading.set(true);
    this.aiService.evaluateAll().subscribe({
      next: (response) => {
        if (!response.data) return;
        this.dataSource.data = response.data;
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        alert("Etwas ist leider schief gelaufen.");
      },
    });
  }
  openDataset(result: EvaluationResult) {
    const target = ConfigService.catalogId + "/form";
    this.router.navigate([target, { id: result.uuid }]);
  }

  openComparisonDialog(result: EvaluationResult) {
    this.dialog.open(ComparisonDialogComponent, {
      data: result,
      width: "800px",
    });
  }
}
