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
import { TreeService } from "../sidebars/tree/tree.service";
import { FormUtils } from "../form.utils";
import { DocumentService } from "../../services/document/document.service";
import { MatDialog } from "@angular/material/dialog";
import { ShortTreeNode } from "../sidebars/tree/tree.types";
import { Router } from "@angular/router";
import { TranslocoService } from "@ngneat/transloco";
import { ConfigService } from "../../services/config/config.service";

export interface StickyHeaderInfo {
  show: boolean;
  headerHeight?: number;
}

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
    private treeService: TreeService,
    private cdr: ChangeDetectorRef,
    private documentService: DocumentService,
    private dialog: MatDialog,
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
    let handled = await FormUtils.handleDirtyForm(
      this.form,
      this.documentService,
      this.dialog,
      this.forAddress,
    );
    if (handled) {
      this.treeService.selectTreeNode(this.forAddress, nodeId);
      const route: any[] = [
        ConfigService.catalogId + (this.forAddress ? "/address" : "/form"),
      ];
      if (nodeId) route.push({ id: this.query.getEntity(nodeId)._uuid });
      this.router.navigate(route);
    }
  }
}
