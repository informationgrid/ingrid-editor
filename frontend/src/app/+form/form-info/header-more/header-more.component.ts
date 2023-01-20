import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from "@angular/core";
import { DocumentState, IgeDocument } from "../../../models/ige-document";
import { animate, style, transition, trigger } from "@angular/animations";
import { DocumentUtils } from "../../../services/document.utils";
import { ProfileQuery } from "../../../store/profile/profile.query";
import { ConfigService } from "../../../services/config/config.service";

@Component({
  selector: "ige-header-more",
  templateUrl: "./header-more.component.html",
  styleUrls: ["./header-more.component.scss"],
  animations: [
    trigger("slideDown", [
      transition(":enter", [
        style({ height: 0, opacity: 0 }),
        animate("300ms", style({ height: 134, opacity: 1 })),
      ]),
      transition(":leave", [
        style({ height: 134, opacity: 1 }),
        animate("300ms", style({ height: 0, opacity: 0 })),
      ]),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderMoreComponent implements OnInit {
  @Input() model: IgeDocument;
  @Input() showMore = false;
  hideFields: any;
  migrated: boolean;

  constructor(
    private profileQuery: ProfileQuery,
    private configService: ConfigService
  ) {}

  ngOnInit() {
    this.hideFields =
      this.profileQuery
        .getValue()
        .ui.hideFormHeaderInfos?.reduce((acc, val) => {
          acc[val] = true;
          return acc;
        }, {}) ?? {};

    const catCreateDate =
      this.configService.$userInfo.getValue().currentCatalog.created;
    // compare the creation dates of document and catalog
    this.migrated = new Date(this.model._created) < catCreateDate;
  }

  getState(state: DocumentState) {
    return DocumentUtils.getStateName(state);
  }

  mapDocumentType(type: string) {
    return this.profileQuery.getEntity(type).label;
  }
}
