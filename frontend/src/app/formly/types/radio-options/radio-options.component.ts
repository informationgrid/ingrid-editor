import { Component, OnInit } from "@angular/core";
import { UntilDestroy } from "@ngneat/until-destroy";
import { FieldTypeConfig, FormlyModule } from "@ngx-formly/core";
import { FieldType } from "@ngx-formly/material";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatRadioButton, MatRadioGroup } from "@angular/material/radio";

interface RadioOption {
  title: string;
  key: string;
}

@UntilDestroy()
@Component({
  selector: "ige-radio-options",
  standalone: true,
  imports: [CommonModule, MatRadioGroup, MatRadioButton, FormsModule],
  templateUrl: "./radio-options.component.html",
  styleUrl: "./radio-options.component.scss",
})
export class RadioOptionsComponent
  extends FieldType<FieldTypeConfig>
  implements OnInit
{
  radioOptions: RadioOption[];
  selectedValue: string = null;

  ngOnInit() {
    this.radioOptions = this.props.radioOptions;
    if (!this.formControl.value) {
      this.formControl.setValue(this.radioOptions[0].key);
    }
    this.selectedValue = this.formControl.value;
  }
  selectOption(option: RadioOption) {
    this.formControl.setValue(option.key);
  }
}
