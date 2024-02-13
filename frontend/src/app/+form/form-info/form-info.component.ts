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
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { IgeDocument } from "../../models/ige-document";
import { TreeQuery } from "../../store/tree/tree.query";
import { tap } from "rxjs/operators";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { AddressTreeQuery } from "../../store/address-tree/address-tree.query";
import { ShortTreeNode } from "../sidebars/tree/tree.types";
import { Router } from "@angular/router";
import { TranslocoService } from "@ngneat/transloco";
import { ConfigService } from "../../services/config/config.service";

@UntilDestroy()
@Component({
  selector: "ige-form-info",
  templateUrl: "./form-info.component.html",
  styleUrls: ["./form-info.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormInfoComponent implements OnInit {
  @Input() form: UntypedFormGroup;

  _model: IgeDocument;
  @Input() set model(value: IgeDocument) {
    this._model = value;
  }

  @Input() forAddress = false;
  @Input() disableTitleEdit = false;

  path: ShortTreeNode[] = [];

  rootName: string;
  private query: AddressTreeQuery | TreeQuery;

  constructor(
    private router: Router,
    private treeQuery: TreeQuery,
    private addressTreeQuery: AddressTreeQuery,
    private cdr: ChangeDetectorRef,
    private translocoService: TranslocoService,
  ) {}

  ngOnInit() {
    if (this.forAddress) {
      this.rootName = this.translocoService.translate("menu.address");
      this.query = this.addressTreeQuery;
    } else {
      this.rootName = this.translocoService.translate("menu.form");
      this.query = this.treeQuery;
    }

    this.query.breadcrumb$
      .pipe(
        untilDestroyed(this),
        tap((path) => (this.path = path.slice(0, -1))),
        tap(() => this.cdr.markForCheck()),
      )
      .subscribe();
  }

  async scrollToTreeNode(nodeId: number) {
    const route: any[] = [
      ConfigService.catalogId + (this.forAddress ? "/address" : "/form"),
    ];
    if (nodeId) route.push({ id: this.query.getEntity(nodeId)._uuid });
    return this.router.navigate(route);
  }
}
