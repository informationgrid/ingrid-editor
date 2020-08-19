import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable, Subscription, timer} from 'rxjs';
import {scan, takeWhile, tap} from 'rxjs/operators';
import {SessionStore} from '../store/session.store';
import {ModalService} from './modal/modal.service';
import {IgeError} from '../models/ige-error';
import {SessionQuery} from '../store/session.query';
import {ApiService} from "./ApiService";

@Injectable({
  providedIn: 'root'
})
export class SessionTimeoutInterceptor implements HttpInterceptor {

  timer$: Subscription;
  private defaultSessionDurationInMillSeconds = 1800;
  private overrideSessionDuration;
  private oneSecondInMilliseconds = 1000;

  constructor(private session: SessionStore, private modalService: ModalService, private apiService: ApiService,
              sessionQuery: SessionQuery) {

    sessionQuery.select('sessionTimeoutDuration')
      .subscribe(duration => this.overrideSessionDuration = duration);
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    return next.handle(request).pipe(
      tap(() => this.resetSessionTimeout())
    );

  }

  private resetSessionTimeout() {

    if (this.timer$) {
      this.timer$.unsubscribe();
    }

    const duration = (this.overrideSessionDuration ?? this.defaultSessionDurationInMillSeconds) + 1;

    this.timer$ = timer(0, this.oneSecondInMilliseconds).pipe(
      scan(acc => --acc, duration),
      takeWhile(x => x >= 0)
    ).subscribe(time => {
      if ((time % 60 == 0) || time < 300) {
        this.updateStore(time)
      }
    });

  }

  private updateStore(time: number) {

    this.session.update({
      sessionTimeoutIn: time
    });

    if (time <= 0) {
      const error = new IgeError();
      error.setMessage('Die Session ist abgelaufen! Sie werden in 5 Sekunden zur Login-Seite geschickt.')
      this.modalService.showIgeError(error);
      this.apiService.logout().subscribe().unsubscribe();
      setTimeout(() => window.location.reload(), 5000);
    }

  }

}
