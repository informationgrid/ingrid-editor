import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
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

  @Output() remove = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
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
      iconClass: this.profileService.getDocumentIcon(
        <IgeDocument>this.address.ref,
      ),
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
}
