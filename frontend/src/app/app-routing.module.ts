import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { AddLeftoverComponent } from './add-leftover/add-leftover.component';
import { ViewLeftoversComponent } from './view-leftovers/view-leftovers.component';
import { SignupLoginComponent } from './signup-login/signup-login.component';
import { BasketComponent } from './basket/basket.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { ReservationsComponent } from './reservations/reservations.component';
import { FeedbacksComponent } from './feedbacks/feedbacks.component';
import { UsersComponent } from './users/users.component';
import { FilterLeftoversComponent } from './filter-leftovers/filter-leftovers.component';
import { ReservationCalendarComponent } from './reservation-calendar/reservation-calendar.component';
import { ManageLeftoversComponent } from './manage-leftovers/manage-leftovers.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

import { AdminGuard, OrgGuard, RestGuard, CombinedGuard } from './guards/role.guard';

const routes: Routes = [
  { path: '', redirectTo: 'Home', pathMatch: 'full' },
  { path: 'Home', component: HomeComponent },
  { path: 'About', component: AboutComponent },
  { path: 'AddLeftover', component: AddLeftoverComponent, canActivate: [RestGuard] },
  { path: 'ViewLeftovers', component: ViewLeftoversComponent, canActivate: [OrgGuard] },
  { path: 'SignUp', component: SignupLoginComponent },
  { path: 'Basket', component: BasketComponent, canActivate: [OrgGuard] },
  { path: 'Dashboard', component: DashboardComponent, canActivate: [AdminGuard] },
  { path: 'Profile', component: ProfileComponent, canActivate: [CombinedGuard] },
  { path: 'Reservations', component: ReservationsComponent, canActivate: [OrgGuard] },
  { path: 'Feedbacks', component: FeedbacksComponent },
  { path: 'Users', component: UsersComponent, canActivate: [AdminGuard] },
  { path: 'FilterLeftovers', component: FilterLeftoversComponent, canActivate: [OrgGuard] },
  { path: 'ReservationCalendar', component: ReservationCalendarComponent, canActivate: [RestGuard] },
  { path: 'ManageLeftovers', component: ManageLeftoversComponent, canActivate: [RestGuard] },
  { path: 'resetPassword', component: ResetPasswordComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }












// import { Component, NgModule } from '@angular/core';
// import { RouterModule, Routes } from '@angular/router';
// // import { RoleGuard } from './guards/role.guard';
// import { HomeComponent } from './home/home.component';
// import { AboutComponent } from './about/about.component';
// import { AddLeftoverComponent } from './add-leftover/add-leftover.component';
// import{ViewLeftoversComponent} from'./view-leftovers/view-leftovers.component';
// import { SignupLoginComponent } from './signup-login/signup-login.component';
// import { BasketComponent } from './basket/basket.component';
// import { DashboardComponent } from './dashboard/dashboard.component';
// import { ProfileComponent } from './profile/profile.component';
// import { ReservationsComponent } from './reservations/reservations.component';
// import { FeedbacksComponent } from './feedbacks/feedbacks.component';
// import { UsersComponent } from './users/users.component';
// import { FilterLeftoversComponent } from './filter-leftovers/filter-leftovers.component';
// import { ReservationCalendarComponent } from './reservation-calendar/reservation-calendar.component';
// import { ManageLeftoversComponent } from './manage-leftovers/manage-leftovers.component';
// import { ResetPasswordComponent } from './reset-password/reset-password.component';

// const routes: Routes = [
//   // {path:'',component:HomeComponent},
//   {path:'',redirectTo:'Home',pathMatch:'full'}, 
//   {path:'Home',component:HomeComponent}, //all can access
//   {path:'About',component:AboutComponent}, //all can access
//   {path:'AddLeftover',component:AddLeftoverComponent}, // rest role=2
//   {path:'ViewLeftovers',component:ViewLeftoversComponent},// org role=3
//   {path:'SignUp',component:SignupLoginComponent},//all can access
//   {path:'Basket',component:BasketComponent},// org role=3
//   {path:'Dashboard',component:DashboardComponent},//admin role=1
//   {path:'Profile',component:ProfileComponent},//rest and org can access role=2 & role=3
//   {path:'Reservations',component:ReservationsComponent},//org role=3
//   {path:'Feedbacks',component:FeedbacksComponent},//all can acess
//   {path:'Users',component:UsersComponent},//admin role=1
//   {path:'FilterLeftovers',component:FilterLeftoversComponent},//org role=3
//   {path:'ReservationCalendar',component:ReservationCalendarComponent},//rest role=2
//   {path:'ManageLeftovers',component:ManageLeftoversComponent},//rest role=2
//   {path:'resetPassword',component:ResetPasswordComponent},//all can access
//   // { path: 'Profile', component: ProfileComponent, canActivate: [RoleGuard], data: { role: 2 } },
//   // { path: 'ViewLeftovers', component: ViewLeftoversComponent, canActivate: [RoleGuard], data: { role: 3 } },
//   // { path: 'Dashboard', component: DashboardComponent, canActivate: [RoleGuard], data: { role: 1 } },

// ];

// @NgModule({
//   imports: [RouterModule.forRoot(routes)],
//   exports: [RouterModule]
// })
// export class AppRoutingModule { }
