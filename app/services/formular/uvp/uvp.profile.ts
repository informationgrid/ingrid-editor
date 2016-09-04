import {
  CheckboxField,
  TableField,
  TextareaField,
  TextboxField,
  Container,
  DropdownField,
  RadioField
} from "../../../+form/controls/index";
import {MapField} from "../../../+form/controls/field-map";

export var profile = [
  new DropdownField({
    key: 'brave',
    label: 'Bravery Rating',
    options: [
      {key: 'solid', value: 'Solid'},
      {key: 'great', value: 'Great'},
      {key: 'good', value: 'Good'},
      {key: 'unproven', value: 'Unproven'}
    ],
    order: 100
  }),


  new Container({
    useGroupKey: 'mainInfo',
    domClass: 'half',
    children: [
      new TextboxField({
        key: 'taskId',
        label: 'Vorhabensnummer',
        // domClass: 'half',
        order: 1
      }),

      new TextboxField({
        key: 'title',
        label: 'Titel',
        // domClass: 'half',
        order: 10
      }),

      new TextareaField({
        key: 'description',
        label: 'Beschreibung',
        // domClass: 'half',
        rows: 10,
        order: 20
      }),
    ]
  }),

  new MapField({
    key: 'map',
    label: 'Karte',
    domClass: 'half',
    height: 370,
    options: {
      zoomControl: true,
      center: new L.LatLng(40.731253, -73.996139),
      zoom: 12,
      minZoom: 4,
      maxZoom: 19,
      layers: [new L.TileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      })]
    },
    settings: {},
    tileDef: new L.TileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
    })
  }),

  new Container({
    useGroupKey: 'repeatableFields',
    label: 'My repeatable Fields',
    isRepeatable: true,
    children: [[
      new TextboxField({
        key: 'repeat1',
        label: 'Repeat 1',
        domClass: 'half',
        order: 1
      }),
      new TextboxField({
        key: 'repeat2',
        label: 'Repeat 2',
        domClass: 'half',
        order: 2
      })
    ]]
  }),

  new TableField({
    key: 'categories',
    label: 'Autos',
    columns: [
      {headerName: 'Vintage', field: 'vin', editable: true},
      {headerName: 'Jahr', field: 'year', editable: true},
      {headerName: 'Marke', field: 'brand'},
      {headerName: 'Farbe', field: 'color'}
    ],
    order: 30
  }),

  new TextboxField({
    key: 'date',
    label: 'Datum',
    domClass: 'half',
    order: 89,
    type: 'date'
  }),

  new CheckboxField({
    key: 'isOpenData',
    label: 'Open Data',
    domClass: 'half',
    order: 90
  }),

  new RadioField({
    key: 'gender',
    label: 'Gender',
    domClass: 'half',
    order: 91,
    options: [
      {label: 'male', value: 'm'},
      {label: 'female', value: 'f'}
    ]
  })
];