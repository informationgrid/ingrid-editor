import {BehaviourService} from './behaviour.service';
import {addProviders, inject} from '@angular/core/testing';
import {BehavioursDefault, Behaviour} from './behaviours';
import {FormularService} from '../formular/formular.service';
import {OpenDataBehaviour} from '../../behaviours';

import objectContaining = jasmine.objectContaining;

class BehaviourMock {
  behaviours: Behaviour[] = [
    {
      id: 'xxx',
      title: 'Dummy',
      description: 'This is a dummy behaviour',
      defaultActive: true,
      register: function (form) {
      }
    },
    new OpenDataBehaviour()
  ];
}

describe( 'Behaviour', () => {

  beforeEach( () => addProviders( [
    FormularService,
    BehaviourService,
    {provide: BehavioursDefault, useClass: BehaviourMock}
  ] ) );

  it( 'should have a bunch of defined behaviours on startup', inject( [BehaviourService], (behaviourService: BehaviourService) => {
    expect( behaviourService.behaviours.length ).toEqual( 2 );
    expect( behaviourService.behaviours[0].id ).toEqual( 'xxx' );
    expect( behaviourService.behaviours[1].id ).toEqual( 'open-data' );
  }) );


  xit('should include external behaviours', () => {


  });


  xit('should include external user behaviours written in javascript', () => {

  });


  xit('should remove a default behaviour', () => {

  });


} );
