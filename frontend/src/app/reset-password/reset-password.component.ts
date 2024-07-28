import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router'; // Import ActivatedRoute and Router
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup;
  resetToken!: string;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient 
  ) { }

  ngOnInit(): void {
    this.initResetPasswordForm();

    this.route.queryParams.subscribe(params => {
      this.resetToken = params['token'];
      console.log(this.resetToken);
    });
  }

  initResetPasswordForm(): void {
    this.resetPasswordForm = this.formBuilder.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const newPassword = formGroup.get('newPassword')!.value;
    const confirmPassword = formGroup.get('confirmPassword')!.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  submitResetPasswordForm(): void {
    console.log("clicked");
    if (this.resetPasswordForm.valid) {
      const password = this.resetPasswordForm.value.newPassword;
      const confirmPassword = this.resetPasswordForm.value.confirmPassword;

      // Send request to backend with reset token, password, and confirmPassword
      this.http.post<any>(`http://localhost:2995/resetPass/`+ this.resetToken, { password, confirmPassword }).subscribe(
        (response) => {
          console.log('Password reset successful:', response);
          // Redirect to login or any other page after password reset
          this.router.navigate(['/SignUp']); // Example redirection to login page
        },
        (error) => {
          console.error('Error resetting password:', error);
          // Handle error response from the backend
        }
      );
    } else {
      this.markFormGroupTouched(this.resetPasswordForm);
    }
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
