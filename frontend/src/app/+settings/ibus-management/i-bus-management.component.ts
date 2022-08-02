import { Component, OnInit } from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { iBusFields } from "./formly-fields";
import { ConfigService } from "../../services/config/config.service";

@Component({
  selector: "ige-ibus-management",
  templateUrl: "./i-bus-management.component.html",
  styleUrls: ["./i-bus-management.component.scss"],
})
export class IBusManagementComponent implements OnInit {
  form = new UntypedFormGroup({});
  fields = iBusFields;
  model: any;

  constructor(private configService: ConfigService) {}

  ngOnInit(): void {
    this.configService
      .getIBusConfig()
      .subscribe((config) => (this.model = { ibus: config }));
  }

  save() {
    this.configService.saveIBusConfig(this.form.value.ibus).subscribe();
  }
}
