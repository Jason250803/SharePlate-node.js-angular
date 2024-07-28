//add-leftover.component.ts
// import { Component, OnInit } from '@angular/core';
// import { FormGroup, FormBuilder, Validators } from '@angular/forms';
// import { ActivatedRoute } from '@angular/router';
// import { Router } from '@angular/router';
// import { HttpClient } from '@angular/common/http';
// import { BehaviorSubject } from 'rxjs';

// // import { Leftover } from '../module/leftovers';

// interface Leftover {
//   type: string;
//   name: string;
//   quantity: number;
//   expiry_date: Date;
//   leftover_image_path: string | null;
//   status: number;
//   leftover_id: number;
// }



// @Component({
//   selector: 'app-add-leftover',
//   templateUrl: './add-leftover.component.html',
//   styleUrls: ['./add-leftover.component.css']
// })
// export class AddLeftoverComponent implements OnInit{
  
//   sessionData: any;
//   leftoverData!: Leftover;
//   leftOverForm!: FormGroup;
//   minExpiryDate!: string; // Minimum expiry date (tomorrow's date)
//   isEditing: boolean = false; // Flag to indicate whether editing an existing leftover
//   selectedFile: File | null = null;
//   // Define regex pattern for input validation
//   namePattern = /^[A-Za-z\s]+$/; // Allows letters and spaces only
//   quantityPattern = /^[1-9][0-9]*$/; // Allows positive integers only
//   isValidateData:boolean=false;//for quantity
//   isValidateName:boolean=false;
//   images: string[] = [
//     "\assets\d585e22830dd15fa7074f5529ebfc9d9.jpg",
//     "\assets\cef9a808acfb2d7260fdfb25c4e4298c.jpg",
//     "\assets\cc523fe8c0ee13451623d43f88688b40.jpg"
//   ];
//   currentIndex = 0;
//   isValidateDate: boolean=false;
//   isValidateType: boolean=false;

//   constructor(
//     private fb: FormBuilder, 
//     private route: ActivatedRoute,
//     private router: Router, // Inject Router service
//     private http:HttpClient
//   ) {}

//   ngOnInit(): void {
//     // Initialize form
//     this.leftOverForm = this.fb.group({
//       type: ['', Validators.required],
//       name: ['', [Validators.required, Validators.pattern(this.namePattern)]],
//       quantity: [0, [Validators.required, Validators.pattern(this.quantityPattern)]],
//       expiryDate: [null, Validators.required],
//       leftover_image_path: ['', Validators.required]
//     });
  
//      // Retrieve the leftover data passed as a parameter
//      this.route.params.subscribe(params => {
//       const leftoverParam = params['leftover'];
//       if (leftoverParam) {
//         this.isEditing = true;
//         this.leftoverData = JSON.parse(leftoverParam);
//         console.log(JSON.parse(leftoverParam));
//         console.log(this.leftoverData);
//         this.isEditing = true; // Set flag to true if editing an existing leftover
//   // Ensure the expiry date is correctly formatted for the input field
//   const formattedExpiryDate = this.leftoverData['expiry_date_formatted'] ? new Date(this.leftoverData['expiry_date_formatted']).toISOString().split('T')[0] : null;

//         // Patch the form with the existing leftover data
//         this.leftOverForm.patchValue({
//           type: this.leftoverData['leftover_type'],
//           name: this.leftoverData['leftover_name'],
//           quantity: this.leftoverData.quantity,
//           expiryDate: this.leftoverData['expiry_date_formatted'],
//           leftover_image_path: this.leftoverData.leftover_image_path
//         });
//       } else {
//         // Initialize new leftover data if no existing data is passed
//         this.leftoverData = this.initializeLeftover();
//       }
//     });
  
//     // Set minimum expiry date to tomorrow's date
//     const today = new Date();
//     const tomorrow = new Date(today);
//     tomorrow.setDate(tomorrow.getDate() + 1);
//     this.minExpiryDate = tomorrow.toISOString().split('T')[0];
//   }
  
// // Initialize a new leftover object
// initializeLeftover(): Leftover {
//   return {
//     type: '',
//     name: '',
//     quantity: 0,
//     expiry_date: new Date(),
//     leftover_image_path: null,
//     status: 1,
//     leftover_id:0
//   };
// }
//   // Getter for easy access to form controls
//   get formControls() {
//     return this.leftOverForm.controls;
//   }
//   onChangeQuantity(){
//     if (this.leftoverData.quantity<1){
//       this.isValidateData=true;
//     }
//     else{
//       this.isValidateData=false;
//     }
//   }
//   onChangeType() {
//     console.log("type",this.leftoverData['leftover_type']);
//     if (!this.leftoverData['leftover_type']) {
//       this.isValidateType = true;
//     } else {
//       this.isValidateType = false;
//     }
//   }
//   onChangeName(){
//     if (this.leftoverData['leftover_name']==''){
//       this.isValidateName=true;
//     }
//     else{
//       this.isValidateName=false;
//     }
//   }
//   onChangeDate(){
//     const expiryDate = new Date(this.leftoverData['expiry_date_formatted']);
//     const tomorrow = new Date();
//     tomorrow.setDate(tomorrow.getDate() + 1);
//     if (this.leftoverData['expiry_date_formatted']<tomorrow){
//       this.isValidateDate=true;
//     }
//     else{
//       this.isValidateDate=false;
//     }
//   }
  

//   // Handle form submission
// onSubmit() {
//   this.onChangeDate();
//   this.onChangeName();
//   this.onChangeQuantity();
//   this.onChangeType();
//   if (this.isValidateData || this.isValidateName || this.isValidateDate || this.isValidateType || this.onFileChange){
//     alert('Please fill in all required fields correctly.');
//     return;
    
//   }
//   const expiryDate = this.leftoverData['expiry_date_formatted'];
//   console.log(expiryDate);
//   new BehaviorSubject(sessionStorage.getItem("sessionData") ?? '{}').subscribe(
//     (data) => {
//       this.sessionData = JSON.parse(data);
//     }
//   );

//   // onSubmit() {
//   //   if (this.leftOverForm.invalid) {
//   //     alert('Please fill in all required fields correctly.');
//   //     return;
//   //   }
  
//   //   const expiryDate = this.leftoverData['expiry_date_formatted'];
//   //   console.log(expiryDate);
//   //   new BehaviorSubject(sessionStorage.getItem("sessionData") ?? '{}').subscribe(
//   //     (data) => {
//   //       this.sessionData = JSON.parse(data);
//   //     }
//   //   );

//   // Get user ID from session data
//   const userId = this.sessionData.session.user.account_id;

//   // Implement logic to handle leftover creation or update
//   if (this.isEditing) {
//     console.log(`Submitting update with userId: ${this.sessionData.session.user.account_id}`); // Log userId

//     const formData = new FormData();
//     formData.append('type', this.leftoverData['leftover_type']);
//     formData.append('name', this.leftoverData['leftover_name']);
//     formData.append('quantity', this.leftoverData.quantity.toString());
//     formData.append('status', this.leftoverData.status.toString());
//     formData.append('userId', this.sessionData.session.user.account_id);
//     if (expiryDate) {
//       formData.append('expiry_date', expiryDate.toString());
//     }
//     if (expiryDate && expiryDate !== this.leftoverData['expiry_date_formatted']) {
//       const formattedExpiryDate = new Date(expiryDate).toISOString().split('T')[0];
//       formData.append('expiry_date', formattedExpiryDate);
//       console.log("Formatted Expiry Date:", formattedExpiryDate);
//     }

//     if (this.selectedFile) {
//       formData.append('leftover_image_path', this.selectedFile, this.selectedFile['leftover_name']);
//     }
//     console.log("edit form:", formData)
//     const leftoverId = this.leftoverData.leftover_id;
    
//     this.http.put<any>(`http://localhost:3000/editleftover/${leftoverId}`, formData)
//       .subscribe(
//         response => {
//           console.log(response);
//           this.navigateToViewLeftovers();
//         },
//         error => {
//           console.error(error);
//         }
//       );
//   } else {
//     console.log('lo data', this.leftoverData)
//     const formData = new FormData();
//     formData.append('type', this.leftoverData['leftover_type']);
//     formData.append('name', this.leftoverData['leftover_name']);
//     formData.append('quantity', this.leftoverData.quantity.toString());
//     formData.append('expiry_date', this.leftoverData['expiry_date_formatted'].toString());
//     formData.append('status', this.leftoverData.status.toString());
//     if (this.selectedFile) {
//       console.log('File to be appended:', this.selectedFile);
//       formData.append('leftover_image_path', this.selectedFile, this.selectedFile['leftover_name']);
//     }
//     new BehaviorSubject(sessionStorage.getItem("sessionData") ?? '{}').subscribe(
//       (data) => {
//         this.sessionData = JSON.parse(data);
//       }
//     );

//     const userId = this.sessionData.session.user.account_id;
//     console.log("from data:", formData);
//     console.log(userId);

//     this.http.post<any>(`http://localhost:3000/addleftover/${userId}`, formData)
//       .subscribe(
//         response => {
//           console.log(response);
//           alert("Leftover added successfully");
//           this.resetForm(); // Call resetForm here
//         },
//         error => {
//           console.error(error);
//         }
//       );
//   }
// }

// // Method to reset the form
// resetForm() {
//   this.leftOverForm.reset();
//   this.selectedFile = null;
//   this.leftoverData = this.initializeLeftover();
//   this.isEditing = false;

//   // Reset form controls explicitly
//   this.leftOverForm.patchValue({
//     type: '',
//     name: '',
//     quantity: 0,
//     expiryDate: null,
//     leftover_image_path: ''
//   });
// }

//   // Method to navigate back to the view leftovers page
//   navigateToViewLeftovers() {
//     this.router.navigate(['/ManageLeftovers']);
//   }

// onFileChange(event: Event) {
//     const fileInput = event.target as HTMLInputElement;
//     if (fileInput.files && fileInput.files[0]) {
//       this.selectedFile = fileInput.files[0];
//       console.log('Selected file:', this.selectedFile);
//     }
//   }


//   // Method to cancel editing and navigate back to view leftovers page
//   cancelEdit() {
//     this.navigateToViewLeftovers();
//   }
// }

















// // //add-leftover.component.ts
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

// import { Leftover } from '../module/leftovers';

interface Leftover {
  type: string;
  name: string;
  quantity: number;
  expiry_date: Date;
  leftover_image_path: string | null;
  status: number;
  leftover_id: number;
}



@Component({
  selector: 'app-add-leftover',
  templateUrl: './add-leftover.component.html',
  styleUrls: ['./add-leftover.component.css']
})
export class AddLeftoverComponent implements OnInit{

  sessionData: any;
  leftoverData!: Leftover;
  leftOverForm!: FormGroup;
  minExpiryDate!: string; // Minimum expiry date (tomorrow's date)
  isEditing: boolean = false; // Flag to indicate whether editing an existing leftover
  selectedFile: File | null = null;
  // Define regex pattern for input validation
  namePattern = /^[A-Za-z\s]+$/; // Allows letters and spaces only
  quantityPattern = /^[1-9][0-9]*$/; // Allows positive integers only

  images: string[] = [
    "\assets\d585e22830dd15fa7074f5529ebfc9d9.jpg",
    "\assets\cef9a808acfb2d7260fdfb25c4e4298c.jpg",
    "\assets\cc523fe8c0ee13451623d43f88688b40.jpg"
  ];
  currentIndex = 0;

  constructor(
    private fb: FormBuilder, 
    private route: ActivatedRoute,
    private router: Router, // Inject Router service
    private http:HttpClient
  ) {}

  ngOnInit(): void {
    // Initialize form
    this.leftOverForm = this.fb.group({
      type: ['', Validators.required],
      name: ['', [Validators.required, Validators.pattern(this.namePattern)]],
      quantity: [0, [Validators.required, Validators.pattern(this.quantityPattern)]],
      expiryDate: [null, Validators.required],
      leftover_image_path: ['', Validators.required]
    });
  
     // Retrieve the leftover data passed as a parameter
     this.route.params.subscribe(params => {
      const leftoverParam = params['leftover'];
      if (leftoverParam) {
        this.isEditing = true;
        this.leftoverData = JSON.parse(leftoverParam);
        console.log(JSON.parse(leftoverParam));
        console.log(this.leftoverData);
        this.isEditing = true; // Set flag to true if editing an existing leftover
  // Ensure the expiry date is correctly formatted for the input field
  const formattedExpiryDate = this.leftoverData['expiry_date_formatted'] ? new Date(this.leftoverData['expiry_date_formatted']).toISOString().split('T')[0] : null;

        // Patch the form with the existing leftover data
        this.leftOverForm.patchValue({
          type: this.leftoverData['leftover_type'],
          name: this.leftoverData['leftover_name'],
          quantity: this.leftoverData.quantity,
          expiryDate: this.leftoverData['expiry_date_formatted'],
          leftover_image_path: this.leftoverData.leftover_image_path
        });
      } else {
        // Initialize new leftover data if no existing data is passed
        this.leftoverData = this.initializeLeftover();
      }
    });
  
    // Set minimum expiry date to tomorrow's date
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.minExpiryDate = tomorrow.toISOString().split('T')[0];
  }
  
// Initialize a new leftover object
initializeLeftover(): Leftover {
  return {
    type: '',
    name: '',
    quantity: 0,
    expiry_date: new Date(),
    leftover_image_path: null,
    status: 1,
    leftover_id:0
  };
}
  // Getter for easy access to form controls
  get formControls() {
    return this.leftOverForm.controls;
  }

// Handle form submission
onSubmit() {
  // if (!this.leftoverData.type || !this.leftoverData.name || !this.leftoverData.quantity || !this.leftoverData.expiry_date || !this.leftoverData.status) {
  //   alert('Please fill in all fields before submitting.');
  //   return;
  // }
  if(this.leftoverData.quantity<=0)
    return;
  const expiryDate = this.leftoverData['expiry_date_formatted'];
  console.log(expiryDate);
  new BehaviorSubject(sessionStorage.getItem("sessionData") ?? '{}').subscribe(
    (data) => {
      this.sessionData = JSON.parse(data);
    }
  );

  // Get user ID from session data
  const userId = this.sessionData.session.user.account_id;

  // Implement logic to handle leftover creation or update
  if (this.isEditing) {
    const formData = new FormData();
    formData.append('type', this.leftoverData['leftover_type']);
    formData.append('name', this.leftoverData['leftover_name']);
    formData.append('quantity', this.leftoverData.quantity.toString());
    formData.append('status', this.leftoverData.status.toString());
    formData.append('userId', this.sessionData.session.user.account_id);
    if (expiryDate) {
      formData.append('expiry_date', expiryDate.toString());
    }
    if (expiryDate && expiryDate !== this.leftoverData['expiry_date_formatted']) {
      const formattedExpiryDate = new Date(expiryDate).toISOString().split('T')[0];
      formData.append('expiry_date', formattedExpiryDate);
      console.log("Formatted Expiry Date:", formattedExpiryDate);
    }

    if (this.selectedFile) {
      formData.append('leftover_image_path', this.selectedFile, this.selectedFile['leftover_name']);
    }
    console.log("edit form:", formData)
    const leftoverId = this.leftoverData.leftover_id;
    
    this.http.put<any>(`http://localhost:3000/editleftover/${leftoverId}`, formData)
      .subscribe(
        response => {
          console.log(response);
          this.navigateToViewLeftovers();
        },
        error => {
          console.error(error);
        }
      );
  } else {
    console.log('lo data', this.leftoverData)
    const formData = new FormData();
    formData.append('type', this.leftoverData['leftover_type']);
    formData.append('name', this.leftoverData['leftover_name']);
    formData.append('quantity', this.leftoverData.quantity.toString());
    formData.append('expiry_date', this.leftoverData['expiry_date_formatted'].toString());
    formData.append('status', this.leftoverData.status.toString());
    if (this.selectedFile) {
      console.log('File to be appended:', this.selectedFile);
      formData.append('leftover_image_path', this.selectedFile, this.selectedFile['leftover_name']);
    }
    new BehaviorSubject(sessionStorage.getItem("sessionData") ?? '{}').subscribe(
      (data) => {
        this.sessionData = JSON.parse(data);
      }
    );

    const userId = this.sessionData.session.user.account_id;
    console.log("from data:", formData);
    console.log(userId);

    this.http.post<any>(`http://localhost:3000/addleftover/${userId}`, formData)
      .subscribe(
        response => {
          console.log(response);
          alert("Leftover added successfully");
          // this.resetForm(); // Call resetForm here
          location.reload();
        },
        error => {
          console.error(error);
        }
      );
  }
}

// Method to reset the form
resetForm() {
  this.leftOverForm.reset();
  this.selectedFile = null;
  this.leftoverData = this.initializeLeftover();
  this.isEditing = false;

  // Reset form controls explicitly
  this.leftOverForm.patchValue({
    type: '',
    name: '',
    quantity: 0,
    expiryDate: null,
    leftover_image_path: ''
  });
}

  // Method to navigate back to the view leftovers page
  navigateToViewLeftovers() {
    this.router.navigate(['/ManageLeftovers']);
  }

onFileChange(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      this.selectedFile = fileInput.files[0];
      console.log('Selected file:', this.selectedFile);
    }
  }


  // Method to cancel editing and navigate back to view leftovers page
  cancelEdit() {
    this.navigateToViewLeftovers();
  }
}


