import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  TemplateRef,
  Type,
  ViewChild,
} from "@angular/core";
import {
  FieldTypeConfig,
  FormlyAttributes,
  FormlyConfig,
  FormlyFieldConfig,
  ɵobserve as observe,
} from "@ngx-formly/core";
import { FieldType, FormlyFieldProps } from "@ngx-formly/material/form-field";
import { ComponentType } from "@angular/cdk/portal";
import { MatCalendarCellClassFunction } from "@angular/material/datepicker";
import { MatTimepickerModule } from "@angular/material/timepicker";
import { MatInputModule } from "@angular/material/input";
import { ReactiveFormsModule } from "@angular/forms";
import { provideNativeDateAdapter } from "@angular/material/core";
import { MatFormFieldModule } from "@angular/material/form-field";

interface TimepickerProps extends FormlyFieldProps {
  timepickerOptions?: Partial<{
    touchUi: boolean;
    opened: boolean;
    disabled: boolean;
    timepickerTogglePosition: "suffix" | "prefix";
    calendarHeaderComponent: ComponentType<any>;
    filter: (date: any | null) => boolean;
    min: any;
    max: any;
    dateInput: (field: FieldTypeConfig<TimepickerProps>, event: any) => void;
    dateChange: (field: FieldTypeConfig<TimepickerProps>, event: any) => void;
    dateClass: MatCalendarCellClassFunction<any>;
    panelClass: string | string[];
    startAt: any | null;
  }>;
}

export interface FormlyTimepickerFieldConfig
  extends FormlyFieldConfig<TimepickerProps> {
  type: "timepicker" | Type<TimepickerTypeComponent>;
}

@Component({
  selector: "formly-field-mat-datepicker",
  template: `
    <input
      matInput
      [id]="id"
      [name]="field.name"
      [errorStateMatcher]="errorStateMatcher"
      [formControl]="formControl"
      [matTimepicker]="picker"
      [formlyAttributes]="field"
      [placeholder]="props.placeholder"
      [tabindex]="props.tabindex"
      [readonly]="props.readonly"
      [required]="required"
    />
    <ng-template #timepickerToggle>
      <mat-timepicker-toggle
        (click)="detectChanges()"
        [disabled]="props.disabled"
        [for]="picker"
      ></mat-timepicker-toggle>
    </ng-template>
    <mat-timepicker
      #picker
      (opened)="props.timepickerOptions.opened = true"
      (closed)="props.timepickerOptions.opened = false"
    >
    </mat-timepicker>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter()],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatTimepickerModule,
    ReactiveFormsModule,
    FormlyAttributes,
  ],
})
export class TimepickerTypeComponent
  extends FieldType<FieldTypeConfig<TimepickerProps>>
  implements AfterViewInit, OnDestroy
{
  @ViewChild("timepickerToggle", { static: true })
  timepickerToggle!: TemplateRef<any>;

  override defaultOptions = {
    props: {
      timepickerOptions: {
        timepickerTogglePosition: "suffix" as const,
        disabled: false,
        opened: false,
      },
    },
  };
  private fieldErrorsObserver!: ReturnType<typeof observe>;

  constructor(
    private config: FormlyConfig,
    private cdRef: ChangeDetectorRef,
  ) {
    super();
  }

  detectChanges() {
    this.options.detectChanges?.(this.field);
  }

  ngAfterViewInit() {
    this.props[this.props.timepickerOptions.timepickerTogglePosition] =
      this.timepickerToggle;
    observe<boolean>(
      this.field,
      ["props", "timepickerOptions", "opened"],
      () => {
        this.cdRef.detectChanges();
      },
    );

    // temporary fix for https://github.com/angular/components/issues/16761
    if (this.config.getValidatorMessage("matDatepickerParse")) {
      this.fieldErrorsObserver = observe<any>(
        this.field,
        ["formControl", "errors"],
        ({ currentValue }) => {
          if (
            currentValue &&
            currentValue.required &&
            currentValue.matDatepickerParse
          ) {
            const errors = Object.keys(currentValue)
              .sort((prop) => (prop === "matDatepickerParse" ? -1 : 0))
              .reduce(
                (errors, prop) => ({ ...errors, [prop]: currentValue[prop] }),
                {},
              );

            this.fieldErrorsObserver?.setValue(errors);
          }
        },
      );
    }
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this.fieldErrorsObserver?.unsubscribe();
  }
}
