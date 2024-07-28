import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule,ReactiveFormsModule  } from '@angular/forms';
import{HttpClientModule}from'@angular/common/http';
import { DatePipe } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CalendarModule } from 'primeng/calendar';
import { KeysPipe} from './jeys.pipe';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header/header.component';
import { AboutComponent } from './about/about.component';
// import { LoginComponent } from './login/login.component';
import { ViewLeftoversComponent } from './view-leftovers/view-leftovers.component';
import { AddLeftoverComponent } from './add-leftover/add-leftover.component';
import { BasketComponent } from './basket/basket.component';
import { SignupLoginComponent } from './signup-login/signup-login.component';
import { FooterComponent } from './footer/footer.component';
import { ProfileComponent } from './profile/profile.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ReservationsComponent } from './reservations/reservations.component';
import { FeedbacksComponent } from './feedbacks/feedbacks.component';
import { UsersComponent } from './users/users.component';
import { FilterLeftoversComponent } from './filter-leftovers/filter-leftovers.component';
import { FilterBarComponent } from './filter-bar/filter-bar.component';
import { ReservationCalendarComponent } from './reservation-calendar/reservation-calendar.component';
import { ManageLeftoversComponent } from './manage-leftovers/manage-leftovers.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HeaderComponent,
    AboutComponent,
    // LoginComponent,
    ViewLeftoversComponent,
    AddLeftoverComponent,
    BasketComponent,
    SignupLoginComponent,
    FooterComponent,
    ProfileComponent,
    DashboardComponent,
    ReservationsComponent,
    FeedbacksComponent,
    UsersComponent,
    FilterLeftoversComponent,
    FilterBarComponent,
    ReservationCalendarComponent,
    ManageLeftoversComponent,
    ResetPasswordComponent,
    KeysPipe
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule ,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule ,
    HttpClientModule ,
    CalendarModule
  ],
  providers: [ 
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
