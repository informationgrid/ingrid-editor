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
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { IgeDocument } from "../../../../models/ige-document";
import { ProfileService } from "../../../../services/profile.service";
import { BackendOption } from "../../../../store/codelist/codelist.model";

export interface AddressRef {
  type: BackendOption;
  ref: Partial<IgeDocument>;
}

@Component({
  selector: "ige-address-card",
  templateUrl: "./address-card.component.html",
  styleUrls: ["./address-card.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressCardComponent implements OnInit {
  @Input() address: AddressRef;
  @Input() disabled = false;
  @Input() canCopy = false;

  @Output() remove = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() copy = new EventEmitter<void>();
  @Output() gotoAddress = new EventEmitter<void>();

  content: {
    iconClass?: string;
    role?: string | BackendOption;
    title?: string;
    secondTitle?: string;
    emailOrPhone?: string;
  } = {};
  invalidAddressReference = false;
  stateInfo: string = "";
  showCopy = false;

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {
    if (!this.address.ref) {
      console.error("Address reference is null!");
      this.content = {
        title: "Ungültige Adressreferenz",
      };
      this.invalidAddressReference = true;
      return;
    }

    this.content = {
      iconClass: this.profileService.getDocumentIcon(this.address.ref._type),
      role: this.address.type,
      title: this.getTitle(this.address.ref),
      secondTitle: this.getSecondTitle(this.address.ref),
      emailOrPhone: this.getEmailOrTelephone(this.address.ref),
    };

    if (typeof this.address.ref === "string") {
      this.content.title = "Gelöschte Adresse";
    }

    this.stateInfo = this.getAddressInfo();
  }

  private getEmailOrTelephone(address: any) {
    const email = address.contact?.filter((item) => item?.type?.key === "3");
    if (email && email.length > 0) {
      return email[0].connection;
    } else {
      const phone = address.contact?.filter((item) => item?.type?.key === "1");
      return phone && phone.length > 0 ? phone[0].connection : "";
    }
  }

  private getTitle(ref: any) {
    return ref.organization?.length > 0
      ? ref.organization
      : (ref.firstName ?? "") + " " + ref.lastName;
  }

  private getSecondTitle(ref: any) {
    return ref.organization?.length > 0 && ref.lastName
      ? (ref.firstName ?? "") + " " + ref.lastName
      : null;
  }

  private getAddressInfo() {
    switch (this.address.ref._state) {
      case "W":
        return "Die Adresse ist nicht veröffentlicht. Ein veröffentlichen des Datensatzes ist aktuell nicht möglich.";
      case "PW":
        return "Für die Adresse existiert eine Bearbeitungskopie. Für die Veröffentlichung des Datensatzes wird die veröffentlichte Adresse verwendet. Bitte veröffentlichen Sie die Adresse, um die Daten aktuell zu halten.";
      default:
        return "";
    }
  }

  @HostListener("window: keyup", ["$event"])
  @HostListener("window: keydown", ["$event"])
  hotkeys(event: KeyboardEvent) {
    this.showCopy = event.ctrlKey && this.copy.observed;
    // this.showCopy = event.ctrlKey && this.canCopy;
  }
}
