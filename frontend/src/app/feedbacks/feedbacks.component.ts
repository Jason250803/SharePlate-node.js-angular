import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-feedbacks',
  templateUrl: './feedbacks.component.html',
  styleUrls: ['./feedbacks.component.css']
})
export class FeedbacksComponent implements OnInit {

  sessionData: any;//for id

  restaurants:any;
  allFeedbacks:any;
  allComplaints :any;
  allRestaurants:any;
  restaurantNames: string[];
  allOrganizations:any[];
  organizationNames:string[];
  
   role:any;
   account_id:any;

  complaintData ={
  reciever_name: '' ,
  message: '' 
  };

  feedbackData={
    message:'',
    rating:0,
  }
  
  currentrating: number;
  // rating:number;
  stars: number[] = [1, 2, 3, 4, 5];
  
 

  
  constructor(private http: HttpClient) { }
  ngOnInit() {
    new BehaviorSubject(sessionStorage.getItem('sessionData') ?? '{}').subscribe(
      (data) => {
        this.sessionData = JSON.parse(data);
        this.role=this.sessionData.session.user.role;
        this.account_id=this.sessionData.session.user.account_id;
        
        // this.getRestaurants(this.account_id);
      }

    );
    console.log('session data is:',this.sessionData);
    console.log('role is:',this.role);
    console.log('acnt:',this.account_id);

    this.getComplaints();
    console.log('Cpmdfr:',this.allComplaints)

    this.getFeedbacks();
    if(this.role==3)
    this.getRestaurantsList();

    if(this.role==2)
    this.getOtganizationsList();
   
    this.feedbackData.rating = 0;
    this.currentrating = 0;
  }
  // getRestaurants(orgId:any){
  //   this.http.get<any>(`http://localhost:3000/restaurants/search/${orgId}`)
  //     .subscribe({
  //       next: (response: any) => {
  //         console.log('Response from server:', response);
  //         console.log(response);
          
  //       }, error: (error) => {
  //         console.error('Error fetching restaurants:', error);


  //       }
  //     });
  // }
   submitComplaint(sender_id:any): void {
  //   // Make the HTTP POST request to send the complaint
  if(this.complaintData.reciever_name==="" || this.complaintData.message=="")
    alert("please fill the form before submit");
  else{
     const data = {
       receiver_name: this.complaintData.reciever_name,
       message: this.complaintData.message
     };


    this.http.post(`http://localhost:3000/${sender_id}/complaint`, data)
      .subscribe(response => {
       console.log('Complaint submitted successfully:', response);
  //       // Optionally, you can handle success actions here
      }, error => {
       console.error('Error submitting complaint:', error);
  //      // Optionally, you can handle error actions here
     });

     this.complaintData.reciever_name='';
     this.complaintData.message='';
     alert("Complaint submitted ")
   }
  }

    submitFeedback(sender_id:any){
      if(this.feedbackData.message==="")
        alert("please fill the form before submit");
      else{
      const data = {
        message:  this.feedbackData.message,
        rating:this.feedbackData.rating

      };
 
 
     this.http.post(`http://localhost:3000/${sender_id}/feedback`, data)
       .subscribe(response => {
        console.log('Feedback submitted successfully:', response);
   //       // Optionally, you can handle success actions here
       }, error => {
        console.error('Error submitting Feedback:', error);
   //      // Optionally, you can handle error actions here
      });
 
      this.feedbackData.message='';
      this.currentrating=0;
      this.feedbackData.rating=0;
      alert("Thank you for sharing your feedback!");
      location.reload();
    }
     
  }

    // getFeedbacks(): void {
    //   this.http.get<any[]>('http://localhost:3000/feedback')
    //     .subscribe({
    //       next: (response: any[]) => {
    //         console.log('Response from server:', response);
    //         this.allFeedbacks=response;
    //       }, error: (error) => {
    //         console.error('Error fetching complaints:', error);
  
  
    //       }
    //     });
    // }
    getFeedbacks(): void {
      this.http.get<any>('http://localhost:3000/feedback')
        .subscribe({
          next: (response: any) => {
            console.log('Response from server:', response);
            this.allFeedbacks = response?.feedback; // Assign response to allFeedbacks
          },
          error: (error) => {
            console.error('Error fetching feedbacks:', error);
          }
        });
    }

    getComplaints(){

      this.http.get<any>('http://localhost:3000/complaints')
      .subscribe({
        next: (response: any) => {
          console.log('Response from server :', response);
          this.allComplaints = response?.complaints; 
          // console.log('inside :',this.allComplaints)
        },
        error: (error) => {
          console.error('Error fetching complaints:', error);
        }
      });
  }
    
  
    highlightStars(value: number): void {
      this.currentrating = value;
    }

    unhighlightStars(): void {
      this.currentrating = this.feedbackData.rating;
    }
  
    rate(value: number): void {
      this.currentrating=value
      this.feedbackData.rating = value;
      console.log(this.feedbackData);
    }

    getRestaurantsList(){
     
      this.http.get<any>(`http://localhost:3000/restaurantsList/${this.account_id}`)
        .subscribe({
          next: (response: any) => {
            console.log('Response from server restaurant lists:', response);
            // this.allRestaurants= response; 
            //  console.log('Response from server restaurant name:', this.allRestaurants);
             this.allRestaurants = response.restaurants;
             this.restaurantNames = this.allRestaurants.map(restaurant => restaurant.user_name);
             console.log('Restaurant names:', this.restaurantNames);
          },
          error: (error) => {
            console.error('Error fetching restaurants:', error);
          }
        });
    }
  
    getOtganizationsList(){
     
      this.http.get<any>(`http://localhost:3000/organizationsList/${this.account_id}`)
        .subscribe({
          next: (response: any) => {
            console.log('Response from server organizations list:', response);
            // this.allOrganizations= response; 
            //  console.log('Response from server restaurant name:', this.allOrganizations);
             this.allOrganizations= response.organizations;
             this.organizationNames = this.allOrganizations.map(organization=> organization.user_name);
             console.log('Restaurant names:', this.restaurantNames);
          },
          error: (error) => {
            console.error('Error fetching organizations:', error);
          }
        });
    }

    sendWarningMail(complaintId: number): void {
      this.http.post(`http://localhost:2995/warningmail/${complaintId}`, {})
        .subscribe(
          (response) => {
            console.log('warning mail sent:', response);
            // Optionally, show a success message or handle UI update
          },
          (error) => {
            console.error('Error sending rwarning mail:', error);
            alert('Error sending warning mail');
          }
        );
    }
}
  



