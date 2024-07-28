import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reservations',
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.css']
})
export class ReservationsComponent {
  selectedDate!: Date;
  reservations: any[] = [];
  tempReservations: any[] = [];
  leftovers: any[] = [];
  dateString: string = '';
  sessionData: any;

  constructor(private datePipe: DatePipe, private http: HttpClient) { }

  ngOnInit() {
    this.fetchReservations();
  }

  fetchReservations() {
    new BehaviorSubject(sessionStorage.getItem("sessionData") ?? '{}').subscribe(
      (data) => {
        this.sessionData = JSON.parse(data);
        const accountId = this.sessionData.session?.user?.account_id;
        this.http.get<any[]>(`http://localhost:3000/reservations/organization/${accountId}`).subscribe(
          data => {
            this.reservations = data;
            console.log("Rservations:",this.reservations);
            this.tempReservations = this.reservations;
            this.leftovers = data; // Assuming leftovers is the same as reservations data
          },
          error => {
            console.error('Error fetching reservations:', error);
          }
        );
      }
    );


  }
  isFutureDate(dateString: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to midnight to compare dates without time
    const date = new Date(dateString);
    return date >= today;

}
}
