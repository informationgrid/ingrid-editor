import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ModalService } from "../services/modal/modal.service";

@Component({
  selector: "login",
  templateUrl: "./login.component.html",
})
export class LoginComponent implements OnInit {
  model: any = {
    username: "admin",
    password: "admin",
  };
  loading = false;
  error = "";

  constructor(private router: Router, private modalService: ModalService) {}

  ngOnInit() {
    // reset login status
    // this.authService.logout();
  }

  login() {
    this.loading = true;
    /*this.authService.login(this.model.username, this.model.password)
      .subscribe(result => {
        // Get the redirect URL from our auth service
        // If no redirect has been set, use the default
        let redirect = this.authService.redirectUrl ? this.authService.redirectUrl : '/form';

        // login successful
        this.router.navigate([redirect]);

      }, err => {
        this.loading = false;
        if (err.status === 0) {
          this.error = 'Backend could not be reached';

        } else if (err.status === 403) {
          // login failed
          this.error = 'Username or password is incorrect';

        } else {
          this.modalService.showError(err.text ? err.text() : err.stack);
        }
      });*/
  }
}
