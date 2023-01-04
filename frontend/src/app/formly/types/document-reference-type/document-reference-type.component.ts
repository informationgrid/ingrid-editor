import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FieldArrayType } from "@ngx-formly/core";
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog";
import {
  SelectGeoDatasetDialog,
  SelectServiceResponse,
} from "./select-service-dialog/select-geo-dataset-dialog.component";
import {
  SelectCswRecordDialog,
  SelectCswRecordResponse,
} from "./select-csw-record-dialog/select-csw-record-dialog";
import { Router } from "@angular/router";
import { ConfigService } from "../../../services/config/config.service";
import { DocumentService } from "../../../services/document/document.service";
import { map } from "rxjs/operators";
import { DocumentState, IgeDocument } from "../../../models/ige-document";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { TreeQuery } from "../../../store/tree/tree.query";

interface Reference {
  isExternalRef: boolean;
}

interface DocumentReference extends Reference {
  title: string;
  uuid: string;
  state: DocumentState;
  type: string;
  icon: "Geodatensatz";
}

interface UrlReference extends Reference {
  title: string;
  url: string;
}

@UntilDestroy()
@Component({
  selector: "ige-document-reference-type",
  templateUrl: "./document-reference-type.component.html",
  styleUrls: ["./document-reference-type.component.scss"],
})
export class DocumentReferenceTypeComponent
  extends FieldArrayType
  implements OnInit
{
  myModel: (DocumentReference | UrlReference)[];

  refreshing = true;

  constructor(
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private router: Router,
    private docService: DocumentService,
    private tree: TreeQuery
  ) {
    super();
  }

  ngOnInit() {
    this.formControl.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((_) => this.buildModel());

    setTimeout(() => this.buildModel());
  }

  showInternalRefDialog() {
    this.dialog
      .open(SelectGeoDatasetDialog, { minWidth: 400, data: this.getRefUuids() })
      .afterClosed()
      .subscribe((item: SelectServiceResponse) => {
        if (item) {
          this.add(null, {
            uuid: item.uuid,
            isExternalRef: false,
            state: item.state,
            type: "InGridGeoDataset",
            icon: "Geodatensatz",
          });
        }
      });
  }

  showExternalRefDialog() {
    this.dialog
      .open(SelectCswRecordDialog, { minWidth: 400 })
      .afterClosed()
      .subscribe((item: SelectCswRecordResponse) => {
        if (item) {
          this.add(null, {
            title: item.title,
            url: item.url,
            isExternalRef: true,
          });
        }
      });
  }

  openReference(item: DocumentReference | UrlReference) {
    if (item.isExternalRef) {
      window.open((<UrlReference>item).url, "_blank");
    } else {
      this.router.navigate([
        `${ConfigService.catalogId}/form`,
        { id: (<DocumentReference>item).uuid },
      ]);
    }
  }

  removeItem(index: number, event: MouseEvent) {
    event.stopImmediatePropagation();
    this.remove(index);
  }

  private async buildModel() {
    this.refreshing = true;
    this.myModel = await Promise.all(
      this.formControl.value.map(async (item) => {
        return item.isExternalRef
          ? this.mapExternalRef(item)
          : this.mapInternalRef(item);
      })
    );
    this.refreshing = false;
    this.cdr.detectChanges();
  }

  private mapExternalRef(item): UrlReference {
    return {
      title: item.title ?? item.url,
      url: item.url,
      isExternalRef: true,
    };
  }

  private async mapInternalRef(item): Promise<DocumentReference> {
    const nodeEntity = this.tree.getByUuid(item.uuid);
    if (nodeEntity) {
      return this.mapToDocumentReference(nodeEntity);
    }

    return await this.docService
      .load(item.uuid, false, false, true)
      .pipe(
        map((doc) => {
          return this.mapToDocumentReference(doc);
        })
      )
      .toPromise();
  }

  private mapToDocumentReference(doc: IgeDocument): DocumentReference {
    return {
      uuid: doc?._uuid,
      isExternalRef: false,
      title: doc?.title,
      state: doc?._state,
      type: doc?._type,
      icon: "Geodatensatz",
    };
  }

  private getRefUuids(): string[] {
    return this.formControl.value
      .filter((item) => item.uuid)
      .map((item) => item.uuid);
  }
}
