/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { TreeNode } from "../../../../store/tree/tree-node.model";
import { BehaviorSubject, of } from "rxjs";
import { DocumentAbstract } from "../../../../store/document/document.model";
import { DocBehavioursService } from "../../../../services/event/doc-behaviours.service";
import { TranslocoService } from "@ngneat/transloco";

@Component({
  selector: "ige-destination-selection",
  templateUrl: "./destination-selection.component.html",
  styleUrls: ["./destination-selection.component.scss"],
})
export class DestinationSelectionComponent implements OnInit {
  @Input() forAddress: boolean;
  @Input() disableRoot = false;
  @Input() typeToInsert: string;

  @Output() choice = new EventEmitter<number>();

  parent: number = null;
  rootNode: Partial<DocumentAbstract>;
  activeTreeNode = new BehaviorSubject<number>(null);
  activeListItem = new BehaviorSubject<Partial<DocumentAbstract>>(undefined);
  showOnlyFolders: boolean;

  constructor(
    private docBehaviours: DocBehavioursService,
    private translocoService: TranslocoService,
  ) {}

  @Input() set initialSelectedId(value: number) {
    if (value !== null) this.activeTreeNode.next(value);
  }

  ngOnInit(): void {
    this.rootNode = {
      id: null,
      title: this.translocoService.translate(
        this.forAddress ? "menu.address" : "menu.form",
      ),
      icon: "Ordner",
      _type: "FOLDER",
      _state: "P",
    };

    this.showOnlyFolders =
      this.docBehaviours.showOnlyFoldersInTreeForDestinationSelection(
        this.forAddress,
      );

    this.activeListItem.next(this.rootNode);
  }

  disabledCondition() {
    return (node: TreeNode) => {
      return this.docBehaviours.cannotAddDocumentBelow()(
        this.forAddress,
        node,
        this.typeToInsert,
      );
    };
  }

  updateParent(node: number[], source: "Tree" | "List") {
    const newParent = node[0] ?? null;
    if (this.parent === newParent) {
      return;
    }

    this.parent = newParent;

    if (source === "List") {
      this.activeTreeNode.next(null);
    } else {
      this.activeListItem.next(null);
    }

    this.choice.next(this.parent);
  }

  getRootNode() {
    return of([this.rootNode]);
  }
}
