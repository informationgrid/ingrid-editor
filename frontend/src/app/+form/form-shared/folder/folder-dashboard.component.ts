import { Component, Input } from "@angular/core";
import { TreeQuery } from "../../../store/tree/tree.query";
import { BehaviorSubject } from "rxjs";
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
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { DocEventsService } from "../../../services/event/doc-events.service";

@UntilDestroy()
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

  constructor(
    private treeQuery: TreeQuery,
    private addressTreeQuery: AddressTreeQuery,
    private configService: ConfigService,
    private formToolbarService: FormToolbarService,
    private docEvents: DocEventsService,
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
    // TODO switch to user specific query

    // wait for store changes to get children of node
    query
      .selectAll()
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        const childrenFromStore = query.getChildren(model._id);
        if (childrenFromStore.length === 0 && model._hasChildren) {
          // load children, as they are not in store yet
          this.docService
            .getChildren(model._id, this.isAddress)
            .pipe(untilDestroyed(this))
            .subscribe();
        }
        this.numChildren = childrenFromStore.length;
        const latestChildren = childrenFromStore
          .sort(
            (c1, c2) =>
              new Date(c2._modified).getTime() -
              new Date(c1._modified).getTime()
          )
          .slice(0, 5);
        this.childDocs$.next(latestChildren);
      });
  }

  createNewFolder() {
    this.docEvents.sendEvent({ type: "CREATE_FOLDER" });
  }

  createNewDataset() {
    this.docEvents.sendEvent({ type: "NEW_DOC" });
  }

  async openDocument(uuid: string) {
    const handled = await FormUtils.handleDirtyForm(
      this.formStateService.getForm(),
      this.docService,
      this.dialog,
      this.isAddress
    );

    if (handled) {
      if (this.isAddress) {
        this.router.navigate(["/address", { id: uuid }]);
      } else {
        this.router.navigate(["/form", { id: uuid }]);
      }
    }
  }
}
