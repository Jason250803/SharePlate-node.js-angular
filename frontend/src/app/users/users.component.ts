// import { Component,OnInit } from '@angular/core';
// import { HttpClient } from '@angular/common/http';

// @Component({
//   selector: 'app-users',
//   templateUrl: './users.component.html',
//   styleUrls: ['./users.component.css']
// })
// export class UsersComponent implements OnInit {
//   restaurantUsers: any;
//   organizationUsers: any;
//   imageBasePath = 'C:/Senior project/backend/nodejs-mysql-auth/public/uploads'

//   ngOnInit(){
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
//           console.log(this.restaurantUsers);

//         }, error: (error) => {
//           console.error('Error fetching users:', error);


//         }
//       });
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

//   async deactivateUser(userId: number): Promise<void> {
//     try {
//       await this.http.put(`http://localhost:3000/deactivate/${userId}`, {}).toPromise();
//       // Reload the page to reflect the changes
//       location.reload();
//     } catch (error) {
//       console.error('Error deactivating user:', error);
//       alert('Error deactivating user');
//     }
//   }
//   activateUser(userId: any): void {
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
//   restaurantsCount(): number {
//     if (!this.restaurantUsers || this.restaurantUsers.length === 0) {
//       return 0;
//     }
//     let count = 0;
//     for (let restaurant of this.restaurantUsers)
//       if (restaurant.status === 1 || restaurant.status === 2)
//         count++;
//     return count;
//   }

//   organizationsCount(): number {
//     if (!this.organizationUsers || this.organizationUsers.length === 0) {
//       return 0;
//     }
//     let count = 0;
//     for (let organization of this.organizationUsers)
//       if (organization.status === 1 || organization.status === 2)
//         count++;
//     return count;
//   }
//   }


import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  restaurantUsers: any;
  organizationUsers: any;
  imageBasePath = 'C:/Senior project/backend/nodejs-mysql-auth/public/uploads';

  ngOnInit() {
    this.getUsers();
  }

  constructor(private http: HttpClient) { }

  getUsers(): void {
    this.http.get<any>('http://localhost:3000/users')
      .subscribe({
        next: (response: any) => {
          console.log('Response from server:', response);
          this.restaurantUsers = response.restaurantUsers;
          this.organizationUsers = response.organizationUsers;
          console.log(this.restaurantUsers);
        },
        error: (error) => {
          console.error('Error fetching users:', error);
        }
      });
  }

  async deleteUser(userId: number): Promise<void> {
    try {
      console.log(`Sending deletion mail for user ID: ${userId}`);
      await this.http.post(`http://localhost:2995/deletemail/${userId}`, {}).toPromise();
      console.log('Deletion mail sent successfully');

      console.log(`Deleting user with ID: ${userId}`);
      await this.http.put(`http://localhost:3000/delete/${userId}`, {}).toPromise();
      console.log('User deleted successfully');
      
      location.reload(); // Reload the page to reflect the changes
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  }

  async deactivateUser(userId: number): Promise<void> {
    try {
      // Step 1: Send deactivation mail
      await this.http.post(`http://localhost:2995/deactivatemail/${userId}`, {}).toPromise();
      console.log('Deactivation mail sent successfully');
      // Step 2: Deactivate user
      await this.http.put(`http://localhost:3000/deactivate/${userId}`, {}).toPromise();
      location.reload(); // Reload the page to reflect the changes
    } catch (error) {
      console.error('Error deactivating user:', error);
      alert('Error deactivating user');
    }
  }

  async activateUser(userId: number): Promise<void> {
    try {
      // Step 1: Send activation mail
      await this.http.post(`http://localhost:2995/activatemail/${userId}`, {}).toPromise();
      console.log('Activation mail sent successfully');
      // Step 2: Activate user
      await this.http.put(`http://localhost:3000/approve/${userId}`, {}).toPromise();
      location.reload(); // Reload the page to reflect the changes
    } catch (error) {
      console.error('Error activating user:', error);
      alert('Error activating user');
    }
  }
  
  restaurantsCount(): number {
    if (!this.restaurantUsers || this.restaurantUsers.length === 0) {
      return 0;
    }
    let count = 0;
    for (let restaurant of this.restaurantUsers) {
      if (restaurant.status === 1 || restaurant.status === 2) {
        count++;
      }
    }
    return count;
  }

  organizationsCount(): number {
    if (!this.organizationUsers || this.organizationUsers.length === 0) {
      return 0;
    }
    let count = 0;
    for (let organization of this.organizationUsers) {
      if (organization.status === 1 || organization.status === 2) {
        count++;
      }
    }
    return count;
  }
}
