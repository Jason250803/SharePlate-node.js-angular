// import { HttpClient } from '@angular/common/http';
// import { Component } from '@angular/core';
// import { Router } from '@angular/router';
// import { GlobalService } from 'C:/Senior project/frontend/src/app/global.service';
// import { OnInit } from '@angular/core';
// import { BehaviorSubject } from 'rxjs';

// @Component({
//   selector: 'app-header',
//   templateUrl: './header.component.html',
//   styleUrls: ['./header.component.css']
// })
// export class HeaderComponent implements OnInit{

//   sitename:string="SHAREPLATE";
//   source:string="/assets/logo.png";

//   sessionData:any;
//   account_id:any;
//   role:any;

//   marginTopValue: number ;

//   ngOnInit(): void {
//     new BehaviorSubject(sessionStorage.getItem('sessionData') ?? '{}').subscribe(
//       (data) => {
//         // setTimeout(()=>{
//         this.sessionData = JSON.parse(data);
//         this.role=this.sessionData.session.user.role;
//         console.log(this.sessionData)
//         this.account_id=this.sessionData.session.user.account_id; 
//         console.log('acount id:',this.account_id) 
//         // Location.
//   } );
//   }
//   constructor(private http:HttpClient,private router:Router){}

// isNormalUser(){
//     if(this.role !=1 && this.role!=2 && this.role!=3 ){
//   if(this.router.url=='/Home' || this.router.url=='/SignUp' || 
//     this.router.url=='/About' || this.router.url=='/Feedbacks')
//     return true;
//  }
//    return false;

// }
// isOrganization() : boolean{
//   if(this.role===3){
//  if(this.router.url=='/ViewLeftovers' || this.router.url=='/Basket' || this.router.url=='/Home'|| this.router.url=='/Profile'||
//     this.router.url=='/Reservations' || this.router.url=='/FilterLeftovers' || this.router.url=='/Feedbacks')
//   return true;
// }
// return false;
// }

// isRestaurant(){
//   if(this.role===2){
//   if(this.router.url=='/ManageLeftovers' || this.router.url=='/Profile' || this.router.url=='/Home' ||
//      this.router.url=='/AddLeftover' || this.router.url=='/Feedbacks' || this.router.url=='/ReservationCalendar')
//    return true
// }return false;
// }

// isAdmin(){
//   if(this.role===1){
//     if(this.router.url=='/Dashboard' || this.router.url=='/Users' ||
//      this.router.url=='/Feedbacks' || this.router.url=='/Home')
//      return true
//   }return false;
// }

// logout() {
//   console.log('Logout button clicked'); // Debug log
//   this.http.get('http://localhost:3000/logout',{ responseType: 'text' }).subscribe({
//     next: () => {
//       console.log('Logout successful, redirecting'); // Debug log
//       sessionStorage.clear();
//       this.router.navigate(['/SignUp']); // Redirect to the SignUp route after logout
//       // this.role==null;
     
//       console.log("role now:",this.role);
     
//     },
//     error: (err) => {
//       console.error('Logout failed', err); // Handle error
//     }
//   });
  
// }


// // isAddLeftover(){
// //   return this.router.url=='/AddLeftover' 
// // }
// }
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, DoCheck } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, DoCheck {

  sitename: string = "SHAREPLATE";
  source: string = "/assets/logo.png";

  sessionData: any;
  account_id: any;
  role: any;

  marginTopValue: number;
  
  sessionDataSubject = new BehaviorSubject<any>(null);

  ngOnInit(): void {
    const storedSessionData = sessionStorage.getItem('sessionData');
    if (storedSessionData) {
      this.sessionDataSubject.next(JSON.parse(storedSessionData));
    }
    this.sessionDataSubject.subscribe(data => {
      if (data) {
        this.sessionData = data;
        this.role = this.sessionData.session.user.role;
        this.account_id = this.sessionData.session.user.account_id;
      }
    });
  }

  ngDoCheck(): void {
    const storedSessionData = sessionStorage.getItem('sessionData');
    if (storedSessionData) {
      const parsedData = JSON.parse(storedSessionData);
      if (JSON.stringify(parsedData) !== JSON.stringify(this.sessionData)) {
        this.sessionDataSubject.next(parsedData);
      }
    }
  }

  constructor(private http: HttpClient, private router: Router) {}

  isNormalUser() {
    return this.role != 1 && this.role != 2 && this.role != 3 && 
      ['/Home', '/SignUp', '/About', '/Feedbacks'].includes(this.router.url);
  }

  isOrganization(): boolean {
    return this.role === 3 && 
      ['/ViewLeftovers', '/Basket', '/Home', '/Profile', '/Reservations', '/FilterLeftovers', '/Feedbacks'].includes(this.router.url);
  }

  isRestaurant() {
    return this.role === 2 && 
      ['/ManageLeftovers', '/Profile', '/Home', '/AddLeftover', '/Feedbacks', '/ReservationCalendar'].includes(this.router.url);
  }

  isAdmin() {
    return this.role === 1 && 
      ['/Dashboard', '/Users', '/Feedbacks', '/Home'].includes(this.router.url);
  }

  logout() {
    console.log('Logout button clicked');
    this.http.get('http://localhost:3000/logout', { responseType: 'text' }).subscribe({
      next: () => {
        console.log('Logout successful, redirecting');
        sessionStorage.clear();
        this.router.navigate(['/SignUp']);
        this.sessionDataSubject.next(null);
        this.role = null;
        console.log("role now:", this.role);
      },
      error: (err) => {
        console.error('Logout failed', err);
      }
    });
  }
}
