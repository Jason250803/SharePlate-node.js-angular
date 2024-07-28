import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-filter-bar',
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.css']
})
export class FilterBarComponent {
  selectedOption:string ='bytype';

  sessionData:any;
  account_id:any;
  profile:any;

  constructor(private http:HttpClient){}
  ngOnInit() {

    new BehaviorSubject(sessionStorage.getItem('sessionData') ?? '{}').subscribe(
      (data) => {
        this.sessionData = JSON.parse(data);
        // this.role=this.sessionData.session.user.role;
        console.log(this.sessionData)
        this.account_id=this.sessionData.session.user.account_id; 
        console.log('acount id:',this.account_id)      
  } );

  this.getOrganization(this.account_id)

}

async getOrganization(orgId:number){

  this.http.get<any>(`http://localhost:3000/leftovers/org/profile/${orgId}`)
    .subscribe({
      next: (response: any) => {
        console.log('Response from server:', response);
        this.profile = response[0] // Assign response to allFeedbacks
        console.log('logo:',this.profile)
      },
      error: (error) => {
        console.error('Error fetching organization profile:', error);
      }
    });
}
}
