import {BehaviourService} from './behaviour.service';
import {inject, TestBed} from '@angular/core/testing';
import {Behaviour, BehavioursDefault} from '../../+behaviours/behaviours';
import {OpenDataBehaviour} from '../../+behaviours/form/OpenData/open-data.behaviour';

import objectContaining = jasmine.objectContaining;
import {AuthService} from '../security/auth.service';
import {Http, HttpModule} from '@angular/http';
import {Router} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {routes} from '../../app.router';

// const behaviourService: BehaviourService;

class StorageServiceMock {
  beforeSave;
}

class BehaviourMock {
  behaviours: Behaviour[] = [
    {
      id: 'xxx',
      title: 'Dummy',
      description: 'This is a dummy behaviour',
      defaultActive: true,
      forProfile: 'UVP',
      register: function (form) {
      },
      unregister: function () {
      }
    },
    new OpenDataBehaviour(null)
  ];
}
console.log( 'start' );
describe( 'Behaviour', () => {

  /*beforeEach( () => addProviders( [
    FormularService,
    BehaviourService,
    {provide: BehavioursDefault, useClass: BehaviourMock}
  ] ) );*/
  beforeEach(() => {
    // console.log('service:', behaviourService);

    // behaviourService = TestBed.get( BehaviourService );
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      // declarations: [BehaviourService],
      imports: [RouterTestingModule.withRoutes(routes)],
      providers: [BehaviourService, {provide: BehavioursDefault, useClass: BehaviourMock}, AuthService]
    });

    console.log( 'configured test module' );

    // refine the test module by declaring the test component
    /*TestBed.configureTestingModule({
      declarations: [ BehaviourService ],
    });*/
    // this.behaviourService = new BehaviourService((new BehaviourMock()).behaviours, new EventManager());

  });


  it( 'should have a bunch of defined behaviours on startup', inject( [BehaviourService], (behaviourService: BehaviourService) => {
    console.log( 'in test' );
    // fixture.detectChanges();

    // behaviourService = TestBed.get( BehaviourService );
    expect( behaviourService.behaviours.length ).toEqual( 2 );
    expect( behaviourService.behaviours[0].id ).toEqual( 'xxx' );
    expect( behaviourService.behaviours[1].id ).toEqual( 'open-data' );
  }));


  xit('should include external behaviours', () => {


  });


  xit('should include external user behaviours written in javascript', () => {

  });


  xit('should remove a default behaviour', () => {

  });


} );
