import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy } from "@angular/core";
import { NgForm } from "@angular/forms";
import { AuthService } from "../auth.service";

@Component({
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.scss"]
})
export class SignupComponent implements OnInit, OnDestroy{
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
  onSignup(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isLoading = true;
    this.authService.createuser(form.value.email, form.value.password);
    console.log(form.value);
  }
  ngOnDestroy() {
      this.authSubscription.unsubscribe();
  }
}
