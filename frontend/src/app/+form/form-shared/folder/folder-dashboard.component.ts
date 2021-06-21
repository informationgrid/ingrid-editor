import { Component, Input } from "@angular/core";
import { TreeQuery } from "../../../store/tree/tree.query";
import { BehaviorSubject } from "rxjs";
import { FormToolbarService } from "../toolbar/form-toolbar.service";
import { DocumentAbstract } from "../../../store/document/document.model";
import { Router } from "@angular/router";
import { DocumentService } from "../../../services/document/document.service";
import { map, tap } from "rxjs/operators";
import { FormUtils } from "../../form.utils";
import { MatDialog } from "@angular/material/dialog";
import { FormStateService } from "../../form-state.service";
import { IgeDocument } from "../../../models/ige-document";

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

  childDocs$ = new BehaviorSubject<DocumentAbstract[]>([]);
  numChildren: number;

  constructor(
    private treeQuery: TreeQuery,
    private formToolbarService: FormToolbarService,
    private router: Router,
    private docService: DocumentService,
    private formStateService: FormStateService,
    private dialog: MatDialog
  ) {}

  updateChildren(model) {
    if (!model._hasChildren) {
      this.numChildren = 0;
      return;
    }

    // TODO switch to user specific query
    this.docService
      .getChildren(model._id, this.isAddress)
      .pipe(
        tap((children) => (this.numChildren = children.length)),
        map((children) =>
          children
            .sort(
              (c1, c2) =>
                new Date(c2._modified).getTime() -
                new Date(c1._modified).getTime()
            )
            .slice(0, 5)
        )
      )
      .subscribe((result) => this.childDocs$.next(result));
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
