import { Component, Input } from "@angular/core";
import { TreeQuery } from "../../../store/tree/tree.query";
import { BehaviorSubject, Subscription } from "rxjs";
import { FormToolbarService } from "../toolbar/form-toolbar.service";
import { DocumentAbstract } from "../../../store/document/document.model";
import { Router } from "@angular/router";
import { DocumentService } from "../../../services/document/document.service";
import { FormUtils } from "../../form.utils";
import { MatDialog } from "@angular/material/dialog";
import { FormStateService } from "../../form-state.service";
import { IgeDocument } from "../../../models/ige-document";
import { AddressTreeQuery } from "../../../store/address-tree/address-tree.query";
import { ConfigService } from "../../../services/config/config.service";

@Component({
  selector: "ige-folder-dashboard",
  templateUrl: "./folder-dashboard.component.html",
  styleUrls: ["./folder-dashboard.component.scss"],
})
export class FolderDashboardComponent {
  @Input() isAddress = false;

  @Input() set model(value: IgeDocument) {
    this.updateChildren(value);
  }

  canCreateAddress: boolean;
  canCreateDataset: boolean;
  childDocs$ = new BehaviorSubject<DocumentAbstract[]>([]);
  numChildren: number;
  private subscription: Subscription;

  constructor(
    private treeQuery: TreeQuery,
    private addressTreeQuery: AddressTreeQuery,
    private configService: ConfigService,
    private formToolbarService: FormToolbarService,
    private router: Router,
    private docService: DocumentService,
    private formStateService: FormStateService,
    private dialog: MatDialog
  ) {
    this.canCreateAddress = configService.hasPermission("can_create_address");
    this.canCreateDataset = configService.hasPermission("can_create_dataset");
  }

  updateChildren(model) {
    const query = this.isAddress ? this.addressTreeQuery : this.treeQuery;

    if (this.subscription) this.subscription.unsubscribe();

    if (!model._hasChildren) {
      this.numChildren = 0;
      return;
    }

    // TODO switch to user specific query

    // wait for store changes to get children of node
    this.subscription = query.selectAll().subscribe(() => {
      const childrenFromStore = query.getChildren(model._id);
      this.numChildren = childrenFromStore.length;
      const latestChildren = childrenFromStore
        .sort(
          (c1, c2) =>
            new Date(c2._modified).getTime() - new Date(c1._modified).getTime()
        )
        .slice(0, 5);
      this.childDocs$.next(latestChildren);
    });
  }

  createNewFolder() {
    this.formToolbarService.toolbarEvent$.next("CREATE_FOLDER");
  }

  createNewDataset() {
    this.formToolbarService.toolbarEvent$.next("NEW_DOC");
  }

  async openDocument(id: number | string) {
    const handled = await FormUtils.handleDirtyForm(
      this.formStateService.getForm(),
      this.docService,
      this.dialog,
      this.isAddress
    );

    if (handled) {
      if (this.isAddress) {
        this.router.navigate(["/address", { id: id }]);
      } else {
        this.router.navigate(["/form", { id: id }]);
      }
    }
  }
}
