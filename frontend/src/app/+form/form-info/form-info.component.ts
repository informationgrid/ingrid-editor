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
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  Input,
  OnInit,
} from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { IgeDocument } from "../../models/ige-document";
import { UntilDestroy } from "@ngneat/until-destroy";
import { ShortTreeNode } from "../sidebars/tree/tree.types";
import { Router } from "@angular/router";
import { TranslocoDirective, TranslocoService } from "@jsverse/transloco";
import { ConfigService } from "../../services/config/config.service";
import { FormStateService } from "../form-state.service";
import { BreadcrumbComponent } from "./breadcrumb/breadcrumb.component";
import { PublishPendingComponent } from "./publish-pending/publish-pending.component";
import { HeaderTitleRowComponent } from "./header-title-row/header-title-row.component";
import { GeneralStore } from "../../store/general.store";
import { TreeStore } from "../../store/tree/tree.store";
import { AddressTreeStore } from "../../store/address-tree/address-tree.store";
import { DocumentService } from "../../services/document/document.service";
import { DocEventsService } from "../../services/event/doc-events.service";
import { BehaviourService } from "../../services/behavior/behaviour.service";

@UntilDestroy()
@Component({
  selector: "ige-form-info",
  templateUrl: "./form-info.component.html",
  styleUrls: ["./form-info.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BreadcrumbComponent,
    PublishPendingComponent,
    HeaderTitleRowComponent,
    TranslocoDirective,
  ],
})
export class FormInfoComponent implements OnInit {
  form = input<UntypedFormGroup>();

  _model: IgeDocument;
  @Input() set model(value: IgeDocument) {
    this._model = value;
  }

  forAddress = input<boolean>(false);
  disableTitleEdit = input<boolean>(false);

  private generalStore = inject(GeneralStore);
  private documentTreeStore = inject(TreeStore);
  private addressTreeStore = inject(AddressTreeStore);
  private documentService = inject(DocumentService);
  private docEvents = inject(DocEventsService);
  private configService = inject(ConfigService);
  private archivePlugin =
    inject(BehaviourService).getBehaviour("plugin.archive");

  private hideUnarchiveForAuthors: boolean =
    this.archivePlugin.data?.hideForAuthors ?? false;

  path = computed<ShortTreeNode[]>(() => {
    if (this.forAddress()) {
      return this.generalStore.breadcrumb().address.slice(0, -1);
    } else {
      return this.generalStore.breadcrumb().document.slice(0, -1);
    }
  });

  rootName: string;
  metadata = this.formStateService.metadata;

  canRemoveFromArchive = computed(() => {
    const isArchived = DocumentService.isDocumentArchived(this.metadata().tags);
    const canUnarchive =
      !this.hideUnarchiveForAuthors || !this.configService.isAuthor();
    return isArchived && canUnarchive;
  });

  isPending = computed(
    () =>
      this.metadata().pendingDate !== null &&
      this.metadata().pendingDate !== undefined &&
      this.metadata().pendingDate !== "",
  );

  constructor(
    private router: Router,
    private translocoService: TranslocoService,
    private formStateService: FormStateService,
  ) {}

  ngOnInit() {
    if (this.forAddress()) {
      this.rootName = this.translocoService.translate("menu.address");
    } else {
      this.rootName = this.translocoService.translate("menu.form");
    }
  }

  async scrollToTreeNode(nodeId: number) {
    const route: any[] = [
      ConfigService.catalogId + (this.forAddress() ? "/address" : "/form"),
    ];
    const store = this.forAddress()
      ? this.addressTreeStore
      : this.documentTreeStore;
    if (nodeId) route.push({ id: store.entityMap()[nodeId]._uuid });
    return this.router.navigate(route);
  }

  stopPublish() {
    this.documentService
      .cancelPendingPublishing(this.metadata().wrapperId, this.forAddress())
      .subscribe();
  }

  unarchive() {
    this.docEvents.sendEvent({ type: "UNARCHIVE" });
  }

  protected readonly stop = stop;
}
