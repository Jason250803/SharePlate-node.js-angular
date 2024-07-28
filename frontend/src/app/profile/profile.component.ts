import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { CountryServiceService } from '../service/country-service.service';

type ProfileDataKey = 'user_name' | 'email' | 'phone' | 'country' | 'city' | 'postal_code' | 'address';

type ProfileData = {
  [key in ProfileDataKey]: string;
};


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})


export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  isEditing: boolean = false;
  restaurantLogo!: string;
  totalLeftovers!: number;
  sessionData: any;
  role: any;
  account_id: any;
  profile: any;
  selectedFile: File | null = null;
  public countries: any[] = [];



  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private countryService: CountryServiceService
  ) { }

  ngOnInit(): void {
    this.countryService.getCountries().subscribe(countries => {
      this.countries = countries;
    });

    this.profileForm = this.formBuilder.group({
      restaurant_username: ['', Validators.required],
      restaurant_email: [''],
      phone: ['', Validators.required],
      country: ['', Validators.required],
      city: ['', Validators.required],
      postal_code: ['', Validators.required],
      address: ['', Validators.required]
    });

    new BehaviorSubject(sessionStorage.getItem('sessionData') ?? '{}').subscribe(
      (data) => {
        this.sessionData = JSON.parse(data);
        this.role = this.sessionData.session.user.role;
        console.log("role is", this.role);
        this.account_id = this.sessionData.session.user.account_id;
      });

    // Retrieve organization profile data
    if(this.role==3)
    this.loadOrganizationProfile();

    this.loadProfile(); // Load the profile data when component initializes

    // if (this.role == 3) {
    //   this.getOrganizationProfile(this.account_id);
    // }
  }

  loadOrganizationProfile(): void {

    // Assuming this.account_id is correctly set from session or elsewhere
    this.http.get<any>(`http://localhost:3000/leftovers/org/profile/${this.account_id}`).subscribe({
      next: (response: any) => {
        console.log('Response from server:', response);
        if (response.length > 0) {
          this.profile = response[0]; // Assign first item from response array to profile
          console.log("pr: ", this.profile);
          console.log("res: ", response[0]);
          this.populateFormWithProfileData(this.profile); // Populate form with fetched profile data
        } else {
          console.error('No organization profile data found');
        }
      },
      error: (error) => {
        console.error('Error fetching organization profile:', error);
      }
    });
  }


  loadProfile(): void {
    // Retrieve session data from sessionStorage
    new BehaviorSubject(sessionStorage.getItem("sessionData") ?? '{}').subscribe(
      (data) => {
        this.sessionData = JSON.parse(data);
        const userId = this.sessionData.session.user.account_id; // Extract the user ID from session data
        if(this.role==2){
        this.fetchProfileData(userId); // Fetch profile data using the user ID
        this.fetchTotalLeftovers(userId);
        }
      }
    );
  }

  fetchProfileData(userId: string): void {
    this.http.get<any[]>(`http://localhost:3000/leftovers/restaurant/profile/${userId}`).subscribe({
      next: (response: any[]) => {
        if (response.length > 0) {
          const profileData = response[0];
          this.populateFormWithProfileData(profileData);
        } else {
          console.error('No profile data found for user ID:', userId);
        }
      },
      error: (error) => {
        console.error('Error loading profile', error);
      }
    });
  }
  fetchTotalLeftovers(userId: string): void {
    this.http.get<{ totalReservedQuantity: number }>(`http://localhost:3000/count/${userId}`).subscribe({
      next: (response) => {
        this.totalLeftovers = response.totalReservedQuantity;
      },
      error: (error) => {
        console.error('Error fetching total leftovers', error);
      }
    });
  }


  populateFormWithProfileData(profileData: any): void {
    var name: string;
    if (profileData.restaurant_username != null)
      name = profileData.restaurant_username;
    if (profileData.organization_username != null)
      name = profileData.organization_username;
    this.profileForm.patchValue({
      restaurant_username: name,
      restaurant_email: profileData.restaurant_email,
      phone: profileData.phone,
      country: profileData.country,
      city: profileData.city,
      postal_code: profileData.postal_code,
      address: profileData.address,

    });
    this.restaurantLogo = profileData.logo_path;
    console.log(this.restaurantLogo)
    // Assuming totalLeftovers is part of profile data
    this.totalLeftovers = profileData.totalLeftovers || 0;
  }
  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    console.log("this . selected file", this.selectedFile)
  }
  enableEditing(): void {
    this.isEditing = true;
  }
  saveProfile(): void {
    console.log('Save profile button clicked');
    console.log('Form Valid:', this.profileForm.valid);
    console.log('Role:', this.role);
    console.log(this.profileForm);
  
    if (this.profileForm.valid) {
      const formData = new FormData();
  
      if (this.role == 2) {
        // Restaurant profile update
        formData.append('restaurant_username', this.profileForm.get('restaurant_username')!.value);
        formData.append('restaurant_email', this.profileForm.get('restaurant_email')!.value);
      } else if (this.role == 3) {
        // Organization profile update
        formData.append('organization_username', this.profileForm.get('restaurant_username')!.value);
        formData.append('organization_email', this.profileForm.get('restaurant_email')!.value);
      }
  
      formData.append('phone', this.profileForm.get('phone')!.value);
      formData.append('country', this.profileForm.get('country')!.value);
      formData.append('city', this.profileForm.get('city')!.value);
      formData.append('postal_code', this.profileForm.get('postal_code')!.value);
      formData.append('address', this.profileForm.get('address')!.value);
  
      if (this.selectedFile) {
        formData.append('logo_path', this.selectedFile);
      }
      console.log(formData);
      const headers = new HttpHeaders();
      const endpoint = this.role == 2 
        ? `http://localhost:3000/editrestaurant/${this.sessionData.session.user.account_id}` 
        : `http://localhost:3000/editorganization/${this.sessionData.session.user.account_id}`;
  
      this.http.put<any>(endpoint, formData, { headers }).subscribe(
        response => {
          console.log(`${this.role == 2 ? 'Restaurant' : 'Organization'} profile updated successfully:`, response);
          this.fetchProfileData(this.sessionData.session.user.account_id);
          this.isEditing = false;
          location.reload();
        },
        error => {
          console.error(`Error updating ${this.role == 2 ? 'restaurant' : 'organization'} profile:`, error);
        }
      );
    } else {
      console.log('Form is invalid');
    }
  }
  

  // async getOrganizationProfile(orgId:number){

  //   this.http.get<any>(`http://localhost:3000/leftovers/org/profile/${this.account_id}`).subscribe({
  //     next: (response: any) => {
  //       console.log('Response from server:', response);
  //       if (response.length > 0) {
  //         this.profile = response[0]; // Assign first item from response array to profile
  //         this.populateFormWithProfileData(this.profile); // Populate form with fetched profile data
  //       } else {
  //         console.error('No organization profile data found');
  //       }
  //     },
  //     error: (error) => {
  //       console.error('Error fetching organization profile:', error);
  //     }
  //   });
  // }

  cancelEditing(): void {
    this.isEditing = false;

  }
}





























// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { HttpClient } from '@angular/common/http';
// import { BehaviorSubject } from 'rxjs';
// import { HttpHeaders } from '@angular/common/http';
// // import { CountryServiceService } from '../service/country-service.service';

// type ProfileDataKey = 'user_name' | 'email' | 'phone' | 'country' | 'city' | 'postal_code' | 'address';

// type ProfileData = {
//   [key in ProfileDataKey]: string;
// };


// @Component({
//   selector: 'app-profile',
//   templateUrl: './profile.component.html',
//   styleUrls: ['./profile.component.css']
// })


// export class ProfileComponent implements OnInit {
//   profileForm!: FormGroup;
//   isEditing: boolean = false;
//   restaurantLogo!: string;
//   totalLeftovers!: number;
//   sessionData: any;
//   role:any;
//   account_id:any;
//   profile:any;
//   selectedFile: File | null = null;
//   public countries: any[] = [];



//   constructor(
//     private formBuilder: FormBuilder,
//     private http: HttpClient,
//     // private countryService: CountryServiceService
//   ) { }

//   ngOnInit(): void {
//     // this.countryService.getCountries().subscribe(countries => {
//       // this.countries = countries;
//     // });
  
//     this.profileForm = this.formBuilder.group({
//       restaurant_username: ['', Validators.required],
//       restaurant_email: ['', [Validators.required, Validators.email]],
//       phone: ['', Validators.required],
//       country: ['', Validators.required],
//       city: ['', Validators.required],
//       postal_code: ['', Validators.required],
//       address: ['', Validators.required]
//     });

//     new BehaviorSubject(sessionStorage.getItem('sessionData') ?? '{}').subscribe(
//       (data) => {
//         this.sessionData = JSON.parse(data);
//         this.role=this.sessionData.session.user.role;
//         console.log("role is",this.role);
//          this.account_id=this.sessionData.session.user.account_id;
//       });


//     this.loadProfile(); // Load the profile data when component initializes

//     if(this.role==3){
//     this.getOrganizationProfile(this.account_id);
//     }
//   }

//   loadProfile(): void {
//     // Retrieve session data from sessionStorage
//     new BehaviorSubject(sessionStorage.getItem("sessionData") ?? '{}').subscribe(
//       (data) => {
//         this.sessionData = JSON.parse(data);
//         const userId = this.sessionData.session.user.account_id; // Extract the user ID from session data
//         this.fetchProfileData(userId); // Fetch profile data using the user ID
//         this.fetchTotalLeftovers(userId);
//       }
//     );
//   }

//   fetchProfileData(userId: string): void {
//     this.http.get<any[]>(`http://localhost:3000/leftovers/restaurant/profile/${userId}`).subscribe({
//       next: (response: any[]) => {
//         if (response.length > 0) {
//           const profileData = response[0];
//           this.populateFormWithProfileData(profileData);
//         } else {
//           console.error('No profile data found for user ID:', userId);
//         }
//       },
//       error: (error) => {
//         console.error('Error loading profile', error);
//       }
//     });
//   }
//   fetchTotalLeftovers(userId: string): void {
//     this.http.get<{ totalReservedQuantity: number }>(`http://localhost:3000/count/${userId}`).subscribe({
//       next: (response) => {
//         this.totalLeftovers = response.totalReservedQuantity;
//       },
//       error: (error) => {
//         console.error('Error fetching total leftovers', error);
//       }
//     });
//   }

//   populateFormWithProfileData(profileData: any): void {
//     this.profileForm.patchValue({
//       restaurant_username: profileData.restaurant_username,
//       restaurant_email: profileData.restaurant_email,
//       phone: profileData.phone,
//       country: profileData.country,
//       city: profileData.city,
//       postal_code: profileData.postal_code,
//       address: profileData.address,
      
//     });
//     this.restaurantLogo = profileData.logo_path;
//     console.log(this.restaurantLogo)
//     // Assuming totalLeftovers is part of profile data
//     this.totalLeftovers = profileData.totalLeftovers || 0;
//   }
//   onFileSelected(event: any): void {
//     this.selectedFile = event.target.files[0];
//     console.log("this . selected file",this.selectedFile)
//   }
//   enableEditing(): void {
//     this.isEditing = true;
//   }
//   saveProfile(): void {
//     if (this.profileForm.valid) {
//       const formData = new FormData();
      
//       // Append form data to FormData object
//       formData.append('restaurant_username', this.profileForm.get('restaurant_username')!.value);
//       formData.append('restaurant_email', this.profileForm.get('restaurant_email')!.value);
//       formData.append('phone', this.profileForm.get('phone')!.value);
//       formData.append('country', this.profileForm.get('country')!.value);
//       formData.append('city', this.profileForm.get('city')!.value);
//       formData.append('postal_code', this.profileForm.get('postal_code')!.value);
//       formData.append('address', this.profileForm.get('address')!.value);
      
//       // Append file if selected
//       if (this.selectedFile) {
//         formData.append('logo_path', this.selectedFile);
//       }
      
//       // Define headers if needed
//       const headers = new HttpHeaders();
//       // Make the HTTP request to update the profile
//       this.http.put<any>(`http://localhost:3000/editrestaurant/${this.sessionData.session.user.account_id}`, formData,  { headers }).subscribe(
//         response => {
//           console.log('Restaurant profile updated successfully:', response);
//           // Optionally, reload the profile data or handle success
//           this.fetchProfileData;
//           // Exit editing mode
//           this.isEditing = false;
//         },
//         error => {
//           console.error('Error updating restaurant profile:', error);
//           // Optionally, display an error message to the user
//         }
//       );
//     }
//   }

//   async getOrganizationProfile(orgId:number){

//     this.http.get<any>(`http://localhost:3000/leftovers/org/profile/${orgId}`)
//       .subscribe({
//         next: (response: any) => {
//           console.log('Response from server:', response);
//           this.profile = response[0] // Assign response to allFeedbacks
//           console.log('logo:',this.profile)
//         },
//         error: (error) => {
//           console.error('Error fetching organization profile:', error);
//         }
//       });
//   }

//   cancelEditing(): void {
//     this.isEditing = false;
//   }
// }
