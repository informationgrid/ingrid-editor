import { Component, computed, inject, input } from "@angular/core";
import { CodelistPipe } from "../../../../app/directives/codelist.pipe";
import { AsyncPipe } from "@angular/common";
import { ConfigService } from "../../../../app/services/config/config.service";
import { Router } from "@angular/router";

interface ReferenceItem {
  type: any;
  title: string;
  referenceType: any;
  explanation: string;
}

interface ReferenceItemUrl extends ReferenceItem {
  url: string;
  urlDataType: any;
}

interface ReferenceItemInternal extends ReferenceItem {
  uuidRef: string;
}

@Component({
  selector: "ige-reference-view",
  standalone: true,
  imports: [CodelistPipe, AsyncPipe],
  templateUrl: "./reference-view.component.html",
  styleUrl: "./reference-view.component.scss",
})
export class ReferenceViewComponent {
  item = input<ReferenceItemUrl | ReferenceItemInternal>();

  private router = inject(Router);

  urlItem = computed<ReferenceItemUrl>(() => {
    if (this.item().referenceType !== "url") return null;
    return this.item() as ReferenceItemUrl;
  });

  internalItem = computed<ReferenceItemInternal>(() => {
    if (this.item().referenceType === "url") return null;
    return this.item() as ReferenceItemInternal;
  });

  async navigate(item: ReferenceItemInternal) {
    return this.router.navigate([
      `${ConfigService.catalogId}/form`,
      { id: item.uuidRef },
    ]);
  }
}
