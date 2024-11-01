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
import { Component, inject, OnInit } from "@angular/core";
import { FieldArrayType } from "@ngx-formly/core";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { debounceTime } from "rxjs/operators";
import { LowerCasePipe } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { FormStateService } from "../../../+form/form-state.service";

@UntilDestroy()
@Component({
  templateUrl: "./assessment.component.html",
  styleUrls: ["./assessment.component.scss"],
  standalone: true,
  imports: [MatIconModule, MatTooltipModule, LowerCasePipe],
})
export class AssessmentComponent extends FieldArrayType implements OnInit {
  private formStateService = inject(FormStateService);

  assessment: Assessment;
  maximumScore: number = 405;

  ngOnInit(): void {
    this.formStateService
      .getForm()
      .valueChanges.pipe(
        untilDestroyed(this),
        debounceTime(100),
      )
      .subscribe((value) => {
        this.assessment = this.calculateAssessment();
      });
  }

  calculateAssessment(): Assessment {
    let score = 0;
    score += this.findabilityScore();
    score += this.accessibilityScore();
    score += this.interoperabilityScore();
    score += this.reusabilityScore();
    score += this.contextualityScore();
    score += this.customScore();
    let rating = this.getRating(score);
    // console.log(this.formStateService.getForm().value);
    return { rating, score };
  }

  // maximum: 100
  private findabilityScore() {
    let state = this.formStateService.getForm().value;
    let score = 0;
    // keywords: 30
    score += this.hasNonEmptySubArray(state.keywords) ? 30 : 0;
    // categories: 30
    score += state.topicCategories?.length ? 30 : 0;
    // spatial: 20
    score += state.spatial?.references?.length > 0 ? 20 : 0;
    // temporal: 20
    score += state.temporal?.events?.length > 0 ? 20 : 0;
    return score;
  }

  // TODO
  // maximum: 100
  private accessibilityScore() {
    let state = this.formStateService.getForm().value;
    let score = 0;
    return score;
  }

  // TODO
  // maximum: 110
  private interoperabilityScore() {
    let state = this.formStateService.getForm().value;
    let score = 0;
    return score;
  }

  // maximum: 75
  private reusabilityScore() {
    let state = this.formStateService.getForm().value;
    let score = 0;
    // access constraints: 20
    score += this.hasNonEmptySubArray(state.resource?.accessConstraints) ? 20 : 0;
    // all access constraints from codelist?: 10
    score += Object.values(state.resource?.accessConstraints).every((ac: object & { key: string }) => ac.key) ? 10 : 0;
    // use constraints: 10
    score += this.hasNonEmptySubArray(state.resource?.useConstraints) ? 10 : 0;
    // all use constraints from codelist?: 5
    score += Object.values(state.resource?.useConstraints).every( (uc: object & { key: string }) => uc.key) ? 5 : 0;
    // md contact: 20
    score += state.pointOfContact.some((contact) => contact?.type?.key == 12) ? 20 : 0;
    // publisher or distributor: 10
    score += state.pointOfContact.some(
      (contact) => contact?.type?.key == 10 || contact?.type?.key == 5) ? 20 : 0;
    return score;
  }

  // maximum: 20
  private contextualityScore() {
    let state = this.formStateService.getForm().value;
    let score = 0;
    // use limitation: 5
    score += state.resource.useLimitation ? 5 : 0;
    // size: 5
    // TODO
    // issue date: 5
    score += this.formStateService.metadata().created ? 5 : 0;
    // modification date: 5
    score += this.formStateService.metadata().modified ? 5 : 0;
    return score;
  }

  // TODO
  private customScore() {
    let state = this.formStateService.getForm().value;
    let score = 0;
    return score;
  }

  private hasNonEmptySubArray(obj: object): boolean {
    if (obj == null) {
      return false;
    }
    return Object.values(obj).some((arr: any[]) => arr?.length);
  }

  private getRating(score: number): Rating {
    // ratings and cutoffs inspired from https://data.europa.eu/mqa/methodology?locale=en#inline-nav-7
    if (score > 0.865 * this.maximumScore) {
      return "Exzellent";
    } else if (score > 0.545 * this.maximumScore) {
      return "Gut";
    } else if (score > 0.297 * this.maximumScore) {
      return "Ausreichend";
    } else {
      return "Mangelhaft";
    }
  }
}

type Assessment = {
  rating: Rating,
  score: number
};

type Rating = 'Exzellent' | 'Gut' | 'Ausreichend' | 'Mangelhaft';
