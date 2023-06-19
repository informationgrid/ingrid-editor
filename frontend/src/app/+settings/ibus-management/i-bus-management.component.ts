import { Component, OnInit } from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { iBusFields } from "./formly-fields";
import { ConfigService } from "../../services/config/config.service";
import { tap } from "rxjs/operators";

@Component({
  selector: "ige-ibus-management",
  templateUrl: "./i-bus-management.component.html",
  styleUrls: ["./i-bus-management.component.scss"],
})
export class IBusManagementComponent implements OnInit {
  form = new UntypedFormGroup({});
  fields = iBusFields;
  model: any;
  connectionStates = [];

  constructor(private configService: ConfigService) {}

  ngOnInit(): void {
    this.configService
      .getIBusConfig()
      .pipe(tap((config) => this.checkConnectionState(config)))
      .subscribe((config) => (this.model = { ibus: config }));
  }

  save() {
    this.configService.saveIBusConfig(this.form.value.ibus).subscribe();
  }

  private checkConnectionState(configs: any[]) {
    configs.forEach((config, index) => {
      this.connectionStates.push({
        id: config.url,
        connected: undefined,
      });
    });

    configs.forEach((config, index) => {
      this.configService
        .isIBusConnected(index)
        .subscribe(
          (connected) => (this.connectionStates[index].connected = connected)
        );
    });
  }
}
