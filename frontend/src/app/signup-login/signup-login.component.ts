
import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { compareValidator } from '../compare.validator';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
// import { AuthService } from '../auth.service';
import { CountryServiceService } from '../service/country-service.service';

@Component({
  selector: 'app-signup-login',
  templateUrl: './signup-login.component.html',
  styleUrls: ['./signup-login.component.css']
})
export class SignupLoginComponent {
  isSignUpVisible: boolean = true;
  isForgotPasswordVisible: boolean = false; 
  isRestaurantSelected: boolean = false;
  isOrganizationSelected: boolean = false;
  isResetPasswordVisible: boolean = false;
  overlayLeft: string = '';
  signUpForm: FormGroup; 
  loginForm: FormGroup;
  forgotPasswordForm: FormGroup; 
  resetPasswordForm: FormGroup;
  licenseImageSrc: string | ArrayBuffer | null = null; 
  logoSrc: string | ArrayBuffer | null = null; 
  licenseFile: File | null = null;
  logoFile: File | null = null;
  public countries: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private countryService: CountryServiceService
  ) {    
    this.signUpForm = this.formBuilder.group({
      password: ['', Validators.required],
      confirmPassword: ['', [Validators.required, compareValidator('password')]]
    });
    this.loginForm = this.formBuilder.group({
      user_name: ['', Validators.required],
      password: ['',Validators.required]
    });
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern('^.+@.+\..+$')]]
    });
    this.resetPasswordForm = this.formBuilder.group({
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required] }, { validators: this.passwordsMatchValidator });
  }

  ngOnInit() {
    this.signUpForm = this.formBuilder.group({
      user_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.pattern('^.+@.+\..+$')]],
      country: ['', Validators.required],
      city: ['', Validators.required],
      postal_code: ['', Validators.required],
      address: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('[0-9]+')]], 
      password: ['', [
        Validators.required,
        Validators.pattern('^(?=.*\\d)(?=.*[a-zA-Z]).{8,}$')
      ]],
      confirmPassword: ['', [Validators.required, compareValidator('password')]],
      license_path: ['', Validators.required],
      logo_path: ['', Validators.required],
      role: ['',Validators.required]
    });
    this.route.queryParams.subscribe(params => {
      if (params['reset']) {
        this.showResetPasswordForm();
      }});
      this.countryService.getCountries().subscribe(countries => {
        this.countries = countries;
      });
    }


  showLoginForm() {
    this.isSignUpVisible = false;
    this.isForgotPasswordVisible = false;
    this.overlayLeft = '25%';
  }

  showSignUpForm() {
    this.isSignUpVisible = true;
    this.isForgotPasswordVisible = false;
    this.overlayLeft = '';

    if (!this.isRestaurantSelected && !this.isOrganizationSelected) {
      console.log("Please select an account type (Restaurant/Organization).");
      return;
    }
  }
  showForgotPasswordForm() {
    this.isSignUpVisible = false;
    this.isForgotPasswordVisible = true;
    this.overlayLeft = '80%';
  }

  showResetPasswordForm() {
    this.isSignUpVisible = false;
    this.isForgotPasswordVisible = false;
    this.isResetPasswordVisible = true;
    this.overlayLeft = '20%';
  }
  onRadioChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    console.log('Selected value:', value); // Check the selected value
    if (value === "2") {
      this.isRestaurantSelected = true;
      this.isOrganizationSelected = false;
      this.signUpForm.get('role')?.setValue('2');
    } else if (value === "3") {
      this.isRestaurantSelected = false;
      this.isOrganizationSelected = true;
      this.signUpForm.get('role')?.setValue('3');
    }
    console.log('isRestaurantSelected:', this.isRestaurantSelected); // Verify the updated value
    console.log('isOrganizationSelected:', this.isOrganizationSelected); // Verify the updated value
  }
  submitForgotPasswordForm() {
    if (this.forgotPasswordForm.valid) {
      // If the form is valid, make an HTTP POST request to the backend
      const email = this.forgotPasswordForm.value.email; // Get the email address from the form
      console.log(email)
      this.http.post<any>('http://localhost:2995/forgotPassword', { email } ).subscribe(
        (response) => {
          // Handle success response from the backend
          console.log('Reset password email sent successfully:', response);
          // Optionally, display a success message to the user
          alert("an email was sent to you to reset your password");
          //this.router.navigate(['/resetPassword'], { queryParams: { resetToken: response.resetToken } });
        },
        (error) => {
          // Handle error response from the backend
          console.error('Error sending reset password email:', error);
          // Optionally, display an error message to the user
        }
      );
    } else {
      console.log('Forgot password form is invalid');
      this.markFormGroupTouched(this.forgotPasswordForm);
    }
  }


  submitResetPasswordForm() {
  if (this.resetPasswordForm.valid) {
    const newPassword = this.resetPasswordForm.get('newPassword')!.value;
    // Logic to reset the password on the server
  }
}


  submitSignUpForm() {
    console.log('submitSignUpForm() called');
    if (this.signUpForm.valid) {
      console.log('Form is valid');
      const formData = new FormData();
      formData.append('user_name', this.signUpForm.get('user_name')!.value);
      formData.append('email', this.signUpForm.get('email')!.value);
      formData.append('country', this.signUpForm.get('country')!.value);
      formData.append('city', this.signUpForm.get('city')!.value);
      formData.append('postal_code', this.signUpForm.get('postal_code')!.value);
      formData.append('address', this.signUpForm.get('address')!.value);
      formData.append('phone', this.signUpForm.get('phone')!.value);
      formData.append('password', this.signUpForm.get('password')!.value);
      formData.append('role', this.signUpForm.get('role')!.value);
// Append the File objects to the FormData object
if (this.licenseFile){
  formData.append('license_path', this.licenseFile);
}
// Append logo file if selected
if (this.logoFile) {
  formData.append('logo_path', this.logoFile);
}
console.log('FormData:', formData);
      this.http.post<any>('http://localhost:3000/register', formData)
        .subscribe(
          response => {
            console.log('Registration successful:', response);
            // Handle successful registration response (e.g., show success message)
            alert('Registration successful. We will send you an email after reviewing your request!');
            //show login
            this.showLoginForm();
          },
          error => {
            
            console.error('Registration error:', error);
            // Handle registration error (e.g., show error message)
            alert('Registration failed. Please try again.');
          }
        );
    } else {
      console.log('Form is invalid');
      // Log invalid fields
      Object.keys(this.signUpForm.controls).forEach(field => {
        const control = this.signUpForm.get(field);
        if (control && control.invalid) { // Check if control is not null
          console.log(`Invalid field: ${field}`);
        }
      });     
      // Form is invalid, mark all form controls as touched to trigger validation messages
      this.markFormGroupTouched(this.signUpForm);
    }
  } 
  submitLoginForm() {
    if (this.loginForm.valid) {
      console.log('Login form submitted');
      console.log(this.loginForm.value);
      const user_name: string = this.loginForm.get('user_name')!.value;
      const password: string = this.loginForm.get('password')!.value; 
      const postData = {
        user_name: user_name,
        password: password
      };
      // const requestOptions = {
      //   withCredentials: true
      // };
      this.http.post<any>('http://localhost:3000/login',postData,{withCredentials:true})
        .subscribe(
          response =>{    
            sessionStorage.setItem('sessionData',JSON.stringify(response));
            console.log('Session data:', response);
            
            // console.log('Login successful:', response);   
            // console.log('Session data:', response.session);   
            // Handle successful login response (e.g., redirect to dashboard)     
            // alert('Login successful'); 
   
            const role=response.session.user.role;
            this.updateRoleAndNavigate(role);
          },     
          error =>{     
            console.error('Login error:', error);     
            // Handle login error (e.g., show error message)    
            alert('Login failed. Please try again.');     
          }     
        );      
      //const formData = new FormData();
      // formData.append('user_name', this.loginForm.get('user_name')!.value);
      // formData.append('password', this.loginForm.get('password')!.value);
  
      /*this.authService.login(formData).subscribe(
        loggedIn => {
          if (loggedIn) {
            console.log('Login successful');
            // Redirect or perform any other action upon successful login
          } else {
            console.log('Login failed');
            // Handle login failure
            alert('Login failed. Please try again.');
          }
        }
      );*/
    } else {
      this.markFormGroupTouched(this.loginForm);
    }
  } 

  updateRoleAndNavigate(role: number) {
    if (role === 2) {
      console.log("inside 2");
      this.router.navigate(['/Profile']);
      // this.reloadCurrentRoute() ;
    } else if (role === 3) {
      this.router.navigate(['/ViewLeftovers']);
      // this.reloadCurrentRoute() ;
    } else if (role === 1) {
      this.router.navigate(['/Dashboard']);
      // this.reloadCurrentRoute() ;
    }
  }
  // Helper method to mark all form controls as touched
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  compareValidator(controlName: string) {
    return (control: any) => {
      if (!control.parent || !control) return null;
      const matchingControl = control.parent.get(controlName);
      if (!matchingControl) return null;
      if (matchingControl.value !== control.value) {
        return { notMatching: true };
      }
      return null;
    };
  }

  passwordsMatchValidator(group: FormGroup) {
    const password = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }


  previewImage(event: any, imageId: string) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            (this as any)[imageId + 'Src'] = reader.result;
        };
        reader.readAsDataURL(file);
        this.licenseFile = file;
    }
}
previewLogo(event: any) {
  const file = event.target.files[0];
  if (file) {
      const reader = new FileReader();
      reader.onload = () => {
          this.logoSrc = reader.result;
      };
      reader.readAsDataURL(file);
      this.logoFile = file;
  }
}

// reloadCurrentRoute() {
//   this.router.navigateByUrl('/refresh', { skipLocationChange: true }).then(() => {
//     this.router.navigate([this.router.url]);
//   });
// }
}
















// import { Component } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { compareValidator } from '../compare.validator';
// import { HttpClient } from '@angular/common/http';
// import { Router } from '@angular/router';


// @Component({
//   selector: 'app-signup-login',
//   templateUrl: './signup-login.component.html',
//   styleUrls: ['./signup-login.component.css']
// })
// export class SignupLoginComponent {

//   isSignUpVisible: boolean = true;
//   isRestaurantSelected: boolean = false;
//   isOrganizationSelected: boolean = false;
//   overlayLeft: string ;
//   signUpForm: FormGroup; 
//   loginForm:FormGroup;
//   licenseImageSrc: string | ArrayBuffer | null = null; 
//   logoSrc: string | ArrayBuffer | null = null; 
//   licenseFile: File | null = null;
//   logoFile: File | null = null;



//   constructor(private formBuilder: FormBuilder,private http:HttpClient,private router: Router) {
//     this.signUpForm = this.formBuilder.group({
//       password: ['', Validators.required],
//       confirmPassword: ['', [Validators.required, compareValidator('password')]]
//     });
//     this.loginForm = this.formBuilder.group({
//       user_name: ['', Validators.required], // Make sure this control is properly initialized
//       password: ['', Validators.required]
//     }); 
//   }

//   ngOnInit() {
//     this.signUpForm = this.formBuilder.group({
//       user_name: ['', Validators.required],
//       email: ['', [Validators.required, Validators.pattern('^.+@.+\..+$')]],
//       country: ['', Validators.required],
//       city: ['', Validators.required],
//       postal_code: ['', Validators.required],
//       address: ['', Validators.required],
//       phone: ['', [Validators.required, Validators.pattern('[0-9]+')]], 
//       password: ['', Validators.required],
//       confirmPassword: ['', [Validators.required, compareValidator('password')]],
//       license_path: ['', Validators.required],
//       logo_path: ['', Validators.required],
//       role: ['',Validators.required]
//     });
    
//   }

//   showLoginForm() {
//     this.isSignUpVisible = false;
//     this.overlayLeft = '20%';
//   }

//   showSignUpForm() {
//     this.isSignUpVisible = true;
//     this.overlayLeft = '';

//     if (!this.isRestaurantSelected && !this.isOrganizationSelected) {
//       console.log("Please select an account type (Restaurant/Organization).");
//       return;
//     }
//   }

//   onRadioChange(event: Event) {
//     const target = event.target as HTMLInputElement;
//     const value = target.value;
//     console.log('Selected value:', value); // Check the selected value
//     if (value === "2") {
//       this.isRestaurantSelected = true;
//       this.isOrganizationSelected = false;
//       this.signUpForm.get('role')?.setValue('2');
//     } else if (value === "3") {
//       this.isRestaurantSelected = false;
//       this.isOrganizationSelected = true;
//       this.signUpForm.get('role')?.setValue('3');
//     }
//     console.log('isRestaurantSelected:', this.isRestaurantSelected); // Verify the updated value
//     console.log('isOrganizationSelected:', this.isOrganizationSelected); // Verify the updated value
//   }

//   submitSignUpForm() {
//     console.log('submitSignUpForm() called');
//     if (this.signUpForm.valid) {
//       console.log('Form is valid');
//       const formData = new FormData();
//       formData.append('user_name', this.signUpForm.get('user_name')!.value);
//       formData.append('email', this.signUpForm.get('email')!.value);
//       formData.append('country', this.signUpForm.get('country')!.value);
//       formData.append('city', this.signUpForm.get('city')!.value);
//       formData.append('postal_code', this.signUpForm.get('postal_code')!.value);
//       formData.append('address', this.signUpForm.get('address')!.value);
//       formData.append('phone', this.signUpForm.get('phone')!.value);
//       formData.append('password', this.signUpForm.get('password')!.value);
//       formData.append('role', this.signUpForm.get('role')!.value);
// // Append the File objects to the FormData object
// if (this.licenseFile) {
//   formData.append('license_path', this.licenseFile);
// }
// // Append logo file if selected
// if (this.logoFile) {
//   formData.append('logo_path', this.logoFile);
// }
// console.log('FormData:', formData);
//       this.http.post<any>('http://localhost:3000/register', formData)
//         .subscribe(
//           response => {
//             console.log('Registration successful:', response);
//             // Handle successful registration response (e.g., show success message)
//             alert('Registration successful');
//             //show login
//             this.showLoginForm();
//           },
//           error => {
//             console.error('Registration error:', error);
//             // Handle registration error (e.g., show error message)
//             alert('Registration failed. Please try again.');
//           }
//         );
//     } else {
//       console.log('Form is invalid');
//       // Log invalid fields
//       Object.keys(this.signUpForm.controls).forEach(field => {
//         const control = this.signUpForm.get(field);
//         if (control && control.invalid) { // Check if control is not null
//           console.log(`Invalid field: ${field}`);
//         }
//       });     
//       // Form is invalid, mark all form controls as touched to trigger validation messages
//       this.markFormGroupTouched(this.signUpForm);
//     }
//   }

//   submitLoginForm() {
//     if (this.loginForm.valid) {
//       console.log('Login form submitted');
//       // console.log(this.loginForm.value);
//       const user_name: string = this.loginForm.get('user_name')!.value;
//       const password: string = this.loginForm.get('password')!.value; 
//       const postData = {
//         user_name: user_name,
//         password: password
//       };
//       this.http.post<any>('http://localhost:3000/login',postData)
//         .subscribe(
//           response =>{    
//             // console.log('Login successful:',response);
//             const role=response.session.user.role;
//             console.log('role is:',role);
//             sessionStorage.setItem('sessionData',JSON.stringify(response));
//             console.log('sessionData:',response);
//             // localStorage.setItem('userLogin',JSON.stringify(response));
//             // Handle successful login response (e.g., redirect to dashboard)     
//             // alert('Login successful');   
//             if(role===2){
//               this.router.navigate(['/Profile'])
//             } 
//             else if(role===1){
//                this.router.navigate(['/Dashboard'])
//             } 
//             else if(role===3){
//               this.router.navigate(['/ViewLeftovers'])
//             }
//           },     
//           error =>{     
//             console.error('Login error:', error);     
//             // Handle login error (e.g., show error message)    
//             alert('Login failed. Please try again.');     
//           }     
//         );      
//       //const formData = new FormData();
//       // formData.append('user_name', this.loginForm.get('user_name')!.value);
//       // formData.append('password', this.loginForm.get('password')!.value);
  
//       /*this.authService.login(formData).subscribe(
//         loggedIn => {
//           if (loggedIn) {
//             console.log('Login successful');
//             // Redirect or perform any other action upon successful login
//           } else {
//             console.log('Login failed');
//             // Handle login failure
//             alert('Login failed. Please try again.');
//           }
//         }
//       );*/
//     } else {
//       this.markFormGroupTouched(this.loginForm);
//     }
//   } 

// // Helper method to mark all form controls as touched
// markFormGroupTouched(formGroup: FormGroup) {
//   Object.values(formGroup.controls).forEach(control => {
//     control.markAsTouched();
//     if (control instanceof FormGroup) {
//       this.markFormGroupTouched(control);
//     }
//   });
// }


//   previewImage(event: any, imageId: string) {
//     const file = event.target.files[0];
//     if (file) {
//         const reader = new FileReader();
//         reader.onload = () => {
//             (this as any)[imageId + 'Src'] = reader.result;
//         };
//         reader.readAsDataURL(file);
//         this.licenseFile = file;
//         // const currentWidth = parseFloat(window.getComputedStyle(document.getElementById('signUp')).getPropertyValue('width'));
//         // document.getElementById('signUp').style.width = `150vh`;
//     }
// }
// previewLogo(event: any) {
//   const file = event.target.files[0];
//   if (file) {
//       const reader = new FileReader();
//       reader.onload = () => {
//           this.logoSrc = reader.result;
//       };
//       reader.readAsDataURL(file);
//       this.logoFile = file;
//   }
// }



// }