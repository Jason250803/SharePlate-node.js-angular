import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{

  counts:any ;

  top3:any;
  constructor(private http: HttpClient) { } 

   ngOnInit(){
  // this.getCountsData() {
  //   return this.http.get<any>('http://your-api-url/counts');
  // }
   this.getTop3()
   this.getCounts()
   }

   getTop3(){
    this.http.get<any>(`http://localhost:3000/leaderboards/`)
      .subscribe({
        next: (response: any) => {
          console.log('Response from Top3 :', response);
          this.top3 = response ;
          console.log('top:',this.top3)

        },
        error: (error) => {
          console.error('Error fetching top3:', error);
        }
      });
  }

  getCounts(){
    this.http.get<any>(`http://localhost:3000/counts`)
      .subscribe({
        next: (response: any) => {
          console.log('Response from server  :', response);
          this.counts=response;
          // this.profile = response // Assign response to allFeedbacks
          console.log('counts:',this.counts.totalLeftovers)
        },
        error: (error) => {
          console.error('Error fetching counts:', error);
        }
      });
  }
}


