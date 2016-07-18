import {FormularService} from './formular.service';
import objectContaining = jasmine.objectContaining;

describe( 'Formular', () => {
  let myFormularService: FormularService;

  beforeEach( () => {
    myFormularService = new FormularService();
  } );
  it( 'should load data', (done: () => void) => {

    myFormularService.loadData( "1" ).then( (data) => {
      expect( data.mainInfo ).toEqual( objectContaining( {taskId: '98765'} ) );
      done();
    } );
  } );

  it( 'should load other data, too', (done: () => void) => {

    myFormularService.loadData( "0" ).then( (data) => {
      expect( data.mainInfo ).toEqual( objectContaining( {taskId: '1234567'} ) );
      done();
    } );
  } );
} );
