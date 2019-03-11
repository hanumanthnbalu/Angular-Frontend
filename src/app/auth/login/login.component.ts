import { AuthService } from './../auth.service';
import { Component, OnInit, OnDestroy } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Subscription } from 'rxjs';

@Component({
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
})
export class LoginComponent implements OnInit, OnDestroy {
  isLoading = false;
  private  authSubscription: Subscription;
  constructor(public authService: AuthService) {}
  ngOnInit() {
    this.authSubscription = this.authService.getAuthStatusListner().subscribe(
      authStatus => {
        this.isLoading = false;
      }
    );
  }
  onLogin(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isLoading = true;
    this.authService.login(form.value.email, form.value.password);
    console.log(form.value);
  }
  ngOnDestroy() {
    this.authSubscription.unsubscribe();
}
}
