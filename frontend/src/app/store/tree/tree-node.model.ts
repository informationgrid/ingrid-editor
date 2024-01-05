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
import { DocumentState } from "../../models/ige-document";

export class TreeNode {
  isExpanded?: boolean;
  afterExpanded?: boolean;

  constructor(
    public _id: number,
    public _uuid: string,
    public title: string = "Kein Titel",
    public type: string,
    public state: DocumentState = null,
    public level = 1,
    public hasChildren = false,
    public parent: number = null,
    public iconClass: string = "Fachaufgabe",
    public isLoading = false,
    public hasWritePermission = false,
    public hasOnlySubtreeWritePermission = false,
    public tags: string = null,
  ) {}
}
