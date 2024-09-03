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
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { DocumentAbstract } from "../../store/document/document.model";
import { Observable, of, Subject } from "rxjs";
import { TreeNode } from "../../store/tree/tree-node.model";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import {
  MatListItemIcon,
  MatListItemTitle,
  MatListOption,
  MatSelectionList,
} from "@angular/material/list";
import { AsyncPipe, DatePipe, LowerCasePipe, NgFor } from "@angular/common";
import { CdkMonitorFocus } from "@angular/cdk/a11y";
import { MatIcon } from "@angular/material/icon";
import { DocumentIconComponent } from "../document-icon/document-icon.component";
import { MatTooltip } from "@angular/material/tooltip";
import { MatDivider } from "@angular/material/divider";
import { DateAgoPipe } from "../../directives/date-ago.pipe";

@UntilDestroy()
@Component({
  selector: "ige-document-list-item",
  templateUrl: "./document-list-item.component.html",
  styleUrls: ["./document-list-item.component.scss"],
  standalone: true,
  imports: [
    MatSelectionList,
    NgFor,
    MatListOption,
    CdkMonitorFocus,
    MatIcon,
    MatListItemIcon,
    DocumentIconComponent,
    MatListItemTitle,
    MatTooltip,
    MatDivider,
    AsyncPipe,
    LowerCasePipe,
    DatePipe,
    DateAgoPipe,
  ],
})
export class DocumentListItemComponent implements OnInit {
  _docs: Observable<DocumentAbstract[] | TreeNode[]>;
  @Input() set docs(
    value: Observable<DocumentAbstract[] | TreeNode[]> | DocumentAbstract[],
  ) {
    this._docs = value instanceof Observable ? value : of(value);
  }
  get docs(): Observable<DocumentAbstract[] | TreeNode[]> {
    return this._docs;
  }
  @Input() doc: DocumentAbstract | TreeNode;
  @Input() denseMode = false;
  @Input() hideDate = true;
  @Input() hideDivider = false;
  @Input() showSelection = false;
  @Input() showIcons = true;
  // this is only needed to prevent expression has changed exception and might be removed later
  @Input() removeSelectionAfter = false;
  @Input() setActiveItem: Subject<Partial<DocumentAbstract>>;
  @Output() select = new EventEmitter<DocumentAbstract | TreeNode>();

  @ViewChild(MatSelectionList) list: MatSelectionList;

  currentSelection: Partial<DocumentAbstract>;

  constructor() {}

  ngOnInit(): void {
    if (this.setActiveItem) {
      this.setActiveItem
        .pipe(untilDestroyed(this))
        .subscribe((doc) => this.updateSelectionFromExternal(doc));
    }
  }

  private updateSelectionFromExternal(doc: Partial<DocumentAbstract>) {
    this.currentSelection = doc;
  }

  makeSelection(doc: DocumentAbstract | TreeNode) {
    // we need to deselect, otherwise an ExpressionChangedAfterItHasBeenCheckedError occurs if we
    // come back to this component (clicking on root folder)
    if (this.removeSelectionAfter && this.list) {
      this.list.deselectAll();
    } else {
      this.currentSelection = doc;
    }
    this.select.next(doc);
  }
}
