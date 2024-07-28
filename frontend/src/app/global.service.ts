// import { Injectable, OnInit } from '@angular/core';
// import{Router}from'@angular/router';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { DatePipe } from '@angular/common';

// import { Leftover } from './module/leftovers';

// @Injectable({
//   providedIn: 'root'
// })
// export class GlobalService{

//   constructor(private router:Router,private http: HttpClient, private datePipe:DatePipe) { }

//   isHomePage():boolean{
//     return this.router.url=='/Home';
//   }

//   isNormalUser(){
//     return (this.router.url=='/Home' || this.router.url=='/SignUp' || 
//     this.router.url=='/About' || this.router.url=='/Feedbacks');
//   }

//   isOrganization(){
//     return (this.router.url=='/ViewLeftovers' || this.router.url=='/Basket' || this.router.url=='/Reservations')
//   }

//   isRestaurant(){
//     return(this.router.url=='/Profile' || this.router.url=='/AddLeftover' )
//   }

//   isAdmin(){
//     return(this.router.url=='/Dashboard' || this.router.url=='/Users' )
//   }

//   fetchLeftovers(): Observable<any[]> {
//     return this.http.get<any[]>('http://localhost:2995/api/leftovers/active');
//   }

// //   fetchActiveLeftovers() {
// //     return this.http.get<any[]>('http://localhost:2995/api/leftovers/active').toPromise();
// //   }

// //   createLeftover(leftoverData: Leftover) {
// //     const formData = new FormData();
// //     formData.append('type', leftoverData.type);
// //     formData.append('name', leftoverData.name);
// //     formData.append('quantity', leftoverData.quantity.toString());
// //     const formattedDate = this.datePipe.transform(leftoverData.expiry_date, 'yyyy-MM-dd');
// //     formData.append('expiry_date', formattedDate || '');

// //     if (leftoverData.leftover_image_path instanceof File) {
// //       formData.append('image', leftoverData.leftover_image_path);
// //     }

// //     formData.append('status', leftoverData.status.toString());
// //     formData.append('restaurant_id', leftoverData.restaurant_id.toString());

// //     return this.http.post('http://localhost:2995/api/leftovers/', formData).toPromise();
// //   }

// //   uploadImage(imageData: File) {
// //     const formData = new FormData();
// //     formData.append('image', imageData);
// //     return this.http.post<any>('http://localhost:2995/upload', formData).toPromise();
// //   }
//  }


