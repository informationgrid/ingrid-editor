import { CheckboxField, RadioField, TextareaField, TextboxField } from '../../../+form/controls/index';
import { OpenTableField } from '../../../+form/controls/field-opentable';
import { Profile } from '../profile';
import { Rubric } from '../../../+form/controls/rubric';
import { DropdownField } from '../../../+form/controls/field-dropdown';
import { FieldBase } from '../../../+form/controls/field-base';
import { CodelistService } from '../../../+form/services/codelist.service';
import { Container } from '../../../+form/controls/container';

export class IsoProfile implements Profile {

  profile: Array<FieldBase<any>> = null;

  constructor(private codelistService: CodelistService) {
    const [addressTypes, advProductGroup] = this.prepareSelects();

    this.profile = [

      new Rubric({
        label: 'Allgemein',
        order: 0,
        children: [
          new TextboxField({
            key: 'title',
            label: 'Titel',
            // domClass: 'half',
            order: 10
          }),

          new TextboxField({
            key: 'previewImage',
            label: 'Vorschaugrafik',
            domClass: 'half',
            order: 10
          }),

          new Container({
            domClass: 'half',
            children: [
              new TextareaField({
                key: 'description',
                label: 'Beschreibung',
                rows: 10
              }),

              new TextboxField({
                key: 'shortDescription',
                label: 'Kurzbezeichnung'
              })
            ]
          }),

          new OpenTableField({
            key: 'addresses',
            label: 'Adressen',
            order: 20,
            columns: [
              {
                editor: addressTypes,
                width: '150px'
              },
              {
                editor: new TextboxField({
                  key: 'addressRef',
                  label: 'Adresse'
                })
              }
            ]
          }),

          new CheckboxField({
            key: 'isAdvCompatible',
            label: 'AdV kompatibel',
            order: 25
          }),

          new CheckboxField({
            key: 'isOpenData',
            label: 'Open Data',
            domClass: 'half',
            order: 25
          }),

          new RadioField({
            key: 'isConform',
            domClass: 'half',
            order: 26,
            options: [
              {label: 'konform', value: 'conform'},
              {label: 'nicht konform', value: 'not_conform'}
            ]
          })
        ]
      }),

      new Rubric({
        label: 'Verschlagwortung',
        order: 30,
        children: [
          new OpenTableField({
            key: 'advProductGroup',
            label: 'AdV-Produktgruppe',
            hideHeader: true,
            order: 30,
            columns: [
              {
                editor: advProductGroup,
                formatter: (key) => advProductGroup.options.find(nr => nr.id === key).value
              }
            ]
          }),
          new OpenTableField({
            key: 'optionalKeywords',
            label: 'Optionale Schlagwörter',
            hideHeader: true,
            order: 30,
            columns: [
              {
                editor: advProductGroup,
                formatter: (key) => advProductGroup.options.find(nr => nr.id === key).value
              }
            ]
          }),

          new CheckboxField({
            key: 'showAsTopic',
            label: 'Als InGrid-Portal-Themenseite anzeigen',
            order: 30
          }),

          new OpenTableField({
            key: 'environmentTopics',
            label: 'Themen',
            hideHeader: true,
            order: 30,
            columns: [
              {
                editor: advProductGroup,
                formatter: (key) => advProductGroup.options.find(nr => nr.id === key).value
              }
            ]
          })

        ]
      }),


      new Rubric({
        label: 'Raumbezugssystem',
        order: 30,
      }),

      new Rubric({
        label: 'Zeitbezug',
        order: 30,
      }),

      new Rubric({
        label: 'Zusatzinformation',
        order: 30,
      }),

      new Rubric({
        label: 'Verweise',
        order: 30,
        children: [
          new OpenTableField({
            key: 'linksTo',
            label: 'Verweise',
            hideHeader: true,
            order: 30,
            columns: [
              {
                editor: advProductGroup,
                formatter: (key) => advProductGroup.options.find(nr => nr.id === key).value
              }
            ]
          })
        ]
      })

    ];
  }

  getTitle(doc: any): string {
    return doc.title;
  }

  getTitleFields(): string[] {
    return ['title'];
  }

  private prepareSelects() {
    const advProductGroupSelect = new DropdownField({
      key: 'advProductGroup',
      label: 'Produktgruppe',
      options: []
    });
    this.codelistService.byId( '8010' ).then( codelist => {
      advProductGroupSelect.options = codelist;
    } );

    const addressTypes = new DropdownField({
      key: 'type',
      label: 'Typ',
      useCodelist: 505,
      options: []
    });
    this.codelistService.byId( '505' ).then( codelist => {
      addressTypes.options = codelist;
    } );

    return [addressTypes, advProductGroupSelect];
  }
}
