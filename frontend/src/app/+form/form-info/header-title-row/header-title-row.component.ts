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
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from "@angular/core";
import { CdkTextareaAutosize } from "@angular/cdk/text-field";
import { ReactiveFormsModule, UntypedFormGroup } from "@angular/forms";
import { IgeDocument } from "../../../models/ige-document";
import { FormMenuService, FormularMenuItem } from "../../form-menu.service";
import { DocumentAbstract } from "../../../store/document/document.model";
import { FormStateService } from "../../form-state.service";
import { TranslocoDirective } from "@ngneat/transloco";
import { DocumentIconComponent } from "../../../shared/document-icon/document-icon.component";
import { MatTooltip } from "@angular/material/tooltip";
import { MatIcon } from "@angular/material/icon";
import { MatFormField } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { MatIconButton } from "@angular/material/button";
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";
import { HeaderMoreComponent } from "../header-more/header-more.component";

@Component({
  selector: "ige-header-title-row",
  templateUrl: "./header-title-row.component.html",
  styleUrls: ["./header-title-row.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    TranslocoDirective,
    DocumentIconComponent,
    MatTooltip,
    MatIcon,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    CdkTextareaAutosize,
    MatIconButton,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    HeaderMoreComponent,
  ],
})
export class HeaderTitleRowComponent implements OnInit {
  @Input() set form(value: UntypedFormGroup) {
    this._form = value;
  }

  @Input() set model(value: IgeDocument) {
    // TODO AW: _model only needed for tooltip => Refactor
    this._model = value;
    const metadata = this.formStateService.metadata();
    // @ts-ignore
    this.doc = {
      ...value,
      _type: metadata.docType,
      _state: metadata.state,
      _tags: metadata.tags,
    };
    this.updateHeaderMenuOptions();
  }

  @Input() disableEdit: boolean;
  @Input() address: boolean;

  @ViewChild("titleInput") titleInput: ElementRef;
  @ViewChild("cfcAutosize") contentFCAutosize: CdkTextareaAutosize;

  _form: UntypedFormGroup;
  _model: IgeDocument;
  showTitleInput = false;
  showMore = false;
  showMoreActions = false;
  doc: DocumentAbstract;

  moreActions: FormularMenuItem[];

  constructor(
    private cdRef: ChangeDetectorRef,
    private formMenuService: FormMenuService,
    private formStateService: FormStateService,
  ) {}

  ngOnInit() {
    this.updateHeaderMenuOptions();
  }

  editTitle() {
    this.showTitleInput = !this.showTitleInput;
    this.cdRef.detectChanges();
    this.contentFCAutosize.resizeToFitContent(true);
    this.titleInput.nativeElement.focus();
  }

  toggleMoreInfo() {
    this.showMore = !this.showMore;
  }

  private updateHeaderMenuOptions() {
    this.moreActions = this.formMenuService.getMenuItems(
      this.address ? "address" : "dataset",
    );
    this.showMoreActions = this.moreActions.length > 0;
  }
}
