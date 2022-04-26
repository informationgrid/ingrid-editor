import { Component, OnInit } from "@angular/core";
import { FormArray, FormGroup } from "@angular/forms";
import { iBusFields } from "./formly-fields";
import { ConfigService } from "../../services/config/config.service";
import { delay, tap } from "rxjs/operators";

@Component({
  selector: "ige-ibus-management",
  templateUrl: "./i-bus-management.component.html",
  styleUrls: ["./i-bus-management.component.scss"],
})
export class IBusManagementComponent implements OnInit {
  form = new FormGroup({});
  fields = iBusFields;
  model: any;
  constructor(private configService: ConfigService) {}

  ngOnInit(): void {
    this.configService
      .getIBusConfig()
      .subscribe((config) => (this.model = { ibus: config }));
  }

  save() {
    console.log(this.form.value);
    this.configService.saveIBusConfig(this.form.value.ibus).subscribe();
  }
}
