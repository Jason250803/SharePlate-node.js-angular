// import { Component, OnInit } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { BehaviorSubject, Observable } from 'rxjs';
// import { catchError } from 'rxjs/operators';


// @Component({
//   selector: 'app-dashboard',
//   templateUrl: './dashboard.component.html',
//   styleUrls: ['./dashboard.component.css']
// })
// export class DashboardComponent implements OnInit {
//   sessionData: any;
//   restaurantUsers: any[];
//   organizationUsers: any[];
//   imageBasePath = 'C:/Senior project/backend/nodejs-mysql-auth/public/uploads'
//   // users: any;
//   ngOnInit() {
//     new BehaviorSubject(sessionStorage.getItem('sessionData') ?? '{}').subscribe(
//       (data) => {
//         this.sessionData = JSON.parse(data);
//       }
//     );
//     console.log('sessionData is :' ,this.sessionData);
//     // console.log(this.userLogin);

//     this.getUsers();
//   }



//   constructor(private http: HttpClient) { }


//   getUsers(): void {
//     this.http.get<any>('http://localhost:3000/users')
//       .subscribe({
//         next: (response: any) => {
//           console.log('Response from server:', response);
//           // Here you can further process the response if needed
//           this.restaurantUsers = response.restaurantUsers;
//           this.organizationUsers = response.organizationUsers;


//         }, error: (error) => {
//           console.error('Error fetching users:', error);


//         }
//       });
//   }


//   approveUser(userId: any): void {
//     this.http.put(`http://localhost:3000/approve/${userId}`, {})
//       .subscribe(
//         () => {
//           // Reload the page to reflect the changes
//           location.reload();
//         },
//         (error) => {
//           console.error('Error approving user:', error);
//           alert('Error approving user');
//         }
//       );
//   }


//   async deleteUser(userId: any): Promise<void> {
//     try {
//       await this.http.put(`http://localhost:3000/delete/${userId}`, {}).toPromise();
//       // Reload the page to reflect the changes
//       location.reload();
//     } catch (error) {
//       console.error('Error deleting user:', error);
//       alert('Error Deleting user');
//     }
//   }
//   reqRestaurantsCount(): number {
//     if (!this.restaurantUsers || this.restaurantUsers.length === 0) {
//       return 0;
//     }
//     let count = 0;
//     for (let restaurant of this.restaurantUsers)
//       if (restaurant.status === 0)
//         count++;
//     return count;
//   }
//   reqOrgtaurantsCount(): number {
//     if (!this.organizationUsers || this.organizationUsers.length === 0) {
//       return 0;
//     }
//     let count = 0;
//     for (let organization of this.organizationUsers)
//       if (organization.status === 0)
//         count++;
//     return count;
//   }
// }


import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  sessionData: any;
  role:any;
  restaurantUsers: any[] = [];
  organizationUsers: any[] = [];
  imageBasePath = 'C:/Senior project/backend/nodejs-mysql-auth/public/uploads';

  constructor(private http: HttpClient) { }

  ngOnInit() {
    new BehaviorSubject(sessionStorage.getItem('sessionData') ?? '{}').subscribe(
      (data) => {
        this.sessionData = JSON.parse(data);
        // this.role=this.sessionData.session.user.role;
      }
    );
    console.log('sessionData is :', this.sessionData);
    this.getUsers();
  }

  getUsers(): void {
    this.http.get<any>('http://localhost:3000/users')
      .subscribe({
        next: (response: any) => {
          console.log('Response from server:', response);
          this.restaurantUsers = response.restaurantUsers;
          this.organizationUsers = response.organizationUsers;
        },
        error: (error) => {
          console.error('Error fetching users:', error);
        }
      });
  }

  approveUser(userId: number, role: number): void {
    // Step 1: Approve user
    this.http.put(`http://localhost:3000/approve/${userId}`, {})
      .subscribe(
        (response) => {
          console.log('Approval successful:', response);
          // Update the status of the user locally to avoid a full reload
          if (role === 2) {
            const user = this.restaurantUsers.find(u => u.account_id === userId);
            if (user) {
              user.status = 1;
            }
          } else if (role === 3) {
            const user = this.organizationUsers.find(u => u.account_id === userId);
            if (user) {
              user.status = 1;
            }
          }
          // Optionally, reload data after approval
          // this.getUsers();

          // Step 2: Send approval mail
          if (role === 2) {
            this.sendApprovalMailRestaurant(userId);
          } else if (role === 3) {
            this.sendApprovalMailOrganization(userId);
          }
        },
        (error) => {
          console.error('Error approving user:', error);
          alert('Error approving user');
        }
      );
  }

  sendApprovalMailRestaurant(userId: number): void {
    this.http.post(`http://localhost:2995/approveRestaurant/${userId}`, {})
      .subscribe(
        (response) => {
          console.log('Restaurant approval mail sent:', response);
          // Optionally, show a success message or handle UI update
        },
        (error) => {
          console.error('Error sending restaurant approval mail:', error);
          alert('Error sending restaurant approval mail');
        }
      );
  }

  sendApprovalMailOrganization(userId: number): void {
    this.http.post(`http://localhost:2995/approveOrganization/${userId}`, {})
      .subscribe(
        (response) => {
          console.log('Organization approval mail sent:', response);
          // Optionally, show a success message or handle UI update
        },
        (error) => {
          console.error('Error sending organization approval mail:', error);
          alert('Error sending organization approval mail');
        }
      );
  }
  deleteUser(userId: number): void {
    // Step 1: Send deletion mail
    this.sendDeletionMail(userId);
  }
  
  sendDeletionMail(userId: number): void {
    this.http.post(`http://localhost:2995/rejectmail/${userId}`, {})
      .subscribe(
        () => {
          console.log('Deletion mail sent successfully');
          // Step 2: Delete user after sending rejection mail
          this.http.put(`http://localhost:3000/delete/${userId}`, {})
            .subscribe(
              () => {
                // Remove the user locally to avoid a full reload
                this.restaurantUsers = this.restaurantUsers.filter(u => u.account_id !== userId);
                this.organizationUsers = this.organizationUsers.filter(u => u.account_id !== userId);
              },
              (error) => {
                console.error('Error deleting user:', error);
                alert('Error deleting user');
              }
            );
        },
        (error) => {
          console.error('Error sending deletion mail:', error);
          alert('Error sending deletion mail');
        }
      );
  }
  
  reqRestaurantsCount(): number {
    return this.restaurantUsers.filter(restaurant => restaurant.status === 0).length;
  }

  reqOrgtaurantsCount(): number {
    return this.organizationUsers.filter(organization => organization.status === 0).length;
  }


  openImageInNewTab(imagePath: string): void {
    const fullPath = `./assets/${imagePath}`;
    window.open(fullPath, '_blank');
  }
}