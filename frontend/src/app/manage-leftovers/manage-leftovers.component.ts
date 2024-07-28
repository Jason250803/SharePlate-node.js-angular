import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { StatusLabels, StatusColors } from '../status';


@Component({
  selector: 'app-manage-leftovers',
  templateUrl: './manage-leftovers.component.html',
  styleUrls: ['./manage-leftovers.component.css']
})
export class ManageLeftoversComponent  implements OnInit {
  leftovers: any[] = [];
  sortOrder: string = 'asc';
  sessionData: any;
 

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.fetchSessionData();
  }

  fetchSessionData(): void {
    new BehaviorSubject(sessionStorage.getItem("sessionData") ?? '{}').subscribe(
      (data) => {
        this.sessionData = JSON.parse(data);
        const accountId = this.sessionData.session?.user?.account_id;
        if (accountId) {
          this.fetchLeftovers(accountId);
        } else {
          console.error('No account ID found in session data.');
        }
      }
    );
  }

  fetchLeftovers(accountId: string): void {
    this.http.get<any[]>(`http://localhost:3000/leftovers/restaurant/${accountId}`).subscribe(
      (data) => {
        this.leftovers = data;
        this.sortLeftovers(this.sortOrder);
        console.log(data);
      },
      (error) => {
        console.error('Error fetching leftovers:', error);
      }
    );
  }

  navigateToAddLeftover() {
    this.router.navigate(['/add-leftover']);
  }

  getStatusLabel(status: number): string {
    return StatusLabels[status as keyof typeof StatusLabels];
  }

  getStatusColor(status: number): string {
    return StatusColors[status as keyof typeof StatusColors];
  }

  editLeftover(leftover: any) {
    this.router.navigate(['/AddLeftover', { leftover: JSON.stringify(leftover) }]);
  }

  deleteLeftover(leftover: any) {
    const leftoverId = leftover.leftover_id;
    this.http.delete(`http://localhost:3000/leftovers/${leftoverId}`).subscribe(
      (response) => {
        console.log('Delete response:', response);
        // Remove the deleted leftover from the list
        this.leftovers = this.leftovers.filter(item => item.leftover_id !== leftoverId);
      },
      (error) => {
        console.error('Error deleting leftover:', error);
        if (error.error && error.error.message) {
          // Display the error message received from the backend to the user
          alert(error.error.message);
        } else {
          // Handle other error cases
          // You can display a generic error message or handle the error in other ways
          console.error('An error occurred while deleting the leftover:', error);
          // Display a generic error message to the user
          alert('An error occurred while deleting the leftover. Please try again later.');
        }
      }
    );
  }
  

  sortLeftovers(order: string) {
    if (order === 'asc') {
      this.leftovers.sort((a, b) => new Date(a.expiry_date_formatted).getTime() - new Date(b.expiry_date_formatted).getTime());
    } else if (order === 'desc') {
      this.leftovers.sort((a, b) => new Date(b.expiry_date_formatted).getTime() - new Date(a.expiry_date_formatted).getTime());
    }
  }
  

  toggleSortOrder() {
    if (this.sortOrder === 'asc') {
      this.sortLeftovers('desc');
      this.sortOrder = 'desc';
    } else {
      this.sortLeftovers('asc');
      this.sortOrder = 'asc';
    }
  }
}

