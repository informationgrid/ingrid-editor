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
import { DocumentState } from "../../models/ige-document";

export interface DocumentAbstract {
  id: string | number;
  title: string;
  icon: string;
  _state: DocumentState;
  _type: string;
  _parent: number;
  _hasChildren: boolean;
  _modified: any;
  _contentModified: any;
  _pendingDate: any;
  _uuid: any;
  _tags: string[];
  hasWritePermission?: boolean;
  hasOnlySubtreeWritePermission?: boolean;
  isRoot?: boolean;
  isAddress: boolean;
}

/**
 * A factory function that creates Document
 */
export function createDocument(params: Partial<DocumentAbstract>) {
  return {
    ...params,
  } as DocumentAbstract;
}
