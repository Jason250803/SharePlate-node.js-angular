import { TypesService } from './../types.service';
import { HttpClient} from '@angular/common/http';
import { Component } from '@angular/core';
import {BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';



// import { TypesService } from '../types.service';
import { Leftover } from '../module/leftovers';
// import { GlobalService } from '../global.service';

@Component({
  selector: 'app-view-leftovers',
  templateUrl: './view-leftovers.component.html',
  styleUrls: ['./view-leftovers.component.css']
})
export class ViewLeftoversComponent {
  sessionData:any;
  account_id:any; 
  profile:any;

  basketQtity:any;

  selectedOption:string ='none';
  leftovers: any[]; 
  restaurants:any[];
  basketLeftovers:any[];
 
  types:any[];


  quantities: { [key: number]: number } = {};
  

  constructor(private http: HttpClient,private router:Router,private typesService:TypesService) {} 


 
  ngOnInit() {


    this.types=this.typesService.types;
    new BehaviorSubject(sessionStorage.getItem('sessionData') ?? '{}').subscribe(
      (data) => {
        this.sessionData = JSON.parse(data);
        // this.role=this.sessionData.session.user.role;
        console.log(this.sessionData);
        this.account_id=this.sessionData.session.user?.account_id; 
        console.log('acount id:',this.account_id) ;  
  } );
  
  this.getOrganizationProfile(this.account_id);

  this.getAllLeftovers(this.account_id);

  this.getAllRestaurants(this.account_id);
  
  this.getBasketLeftovers();



}
decrement(leftoverId : number) {
   if (this.quantities[leftoverId] > 0) 
    this.quantities[leftoverId]--;
  
}

increment(maxQtity:number,leftoverId:number) {
   if(this.quantities[leftoverId]<maxQtity)
   this.quantities[leftoverId]++;
}

updateQuantity(event: Event,leftoverId:number) {
   const target = event.target as HTMLInputElement;//downcast the event to target to accept the .value
   const parsedValue = parseInt(target.value, 10);
     if (!isNaN(parsedValue)) {
    this.quantities[leftoverId] = parsedValue;
   
 }
}


addLeftover(maxQtity:number,leftoverId:number){
     console.log("chosen qtity:",this.quantities[leftoverId])
     if(this.quantities[leftoverId]<1)
      alert("At least add one leftover");
    else{
     if(this.quantities[leftoverId]>maxQtity )
      {
        alert("Sorry,this quantity is not available");
      }
      //if the input qtity is le than mxQtity
      else{
        let leftoverFound = false;
        //search in basketItems if there is the same leftoverid
        //if the basketItems contain leftovers
        if(this.basketLeftovers && this.basketLeftovers.length>0){
          //cheking each leftover in the basket item
          for(let leftover of this.basketLeftovers){

            if(leftoverId===leftover.leftover_id ){
              leftoverFound = true;
              console.log("maxQtity:",maxQtity)
              console.log("qtity to add",this.quantities[leftoverId])
              console.log("qtity in basket",leftover.bquantity)
              const reservedQuantity=this.quantities[leftoverId]+leftover.bquantity;
              console.log('qutity to add :',reservedQuantity)

              const basketItemId=leftover.basket_item_id;
              const requestData = { reservedQuantity: reservedQuantity };
              console.log("basket id:",basketItemId)
              this.http.put(`http://localhost:3000/cart/${basketItemId}`,requestData)
              .subscribe(response => {
               console.log('Leftover edited successfully:', response);
               alert("Leftover added to the basket");
               this.getBasketLeftovers();
              //  break; 
               
            }, error => {
            console.error('Error editing Leftover:', error);
            
            });
          }
        }
      }
    
      if (!leftoverFound) {
        const data = {
          leftoverId: leftoverId,
          reservedQuantity: this.quantities[leftoverId]
        };
  
        this.http.post(`http://localhost:3000/cart/${this.account_id}`, data)
          .subscribe(response => {
            console.log('Leftover added successfully:', response);
            this.getBasketLeftovers();
          }, error => {
            console.error('Error adding Leftover:', error);
          });
          alert("Lefotvers added to the basket");
      }
    }
  }
}



getBasketLeftovers(){

  this.http.get<any>(`http://localhost:3000/cart/${this.account_id}`)
  .subscribe({
    next: (response: any) => {
      console.log('Response from server all basket leftovers:', response);
      this.basketLeftovers = response;
    },
    error: (error) => {
      console.error('Error fetching leftovers:', error);
    }
  });
}


  async getOrganizationProfile(orgId:number){

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

    getAllRestaurants(orgId:number){
      this.http.get<any>(`http://localhost:3000/restaurants/search/${orgId}`)
        .subscribe({
          next: (response: any) => {
            console.log('Response from server restaurants:', response);
            this.restaurants=response;
          },
          error: (error) => {
            console.error('Error fetching Restaurants:', error);
          }
        });

    }

    getAllLeftovers(orgId:number){
      this.http.get<any>(`http://localhost:3000/restaurants/leftoversbycountry/${orgId}`)
        .subscribe({
          next: (response: any) => {
            // console.log('Response from server leftovers:', response);
            this.leftovers = response 
            console.log('leftovers',this.leftovers)
            if (this.leftovers && this.leftovers.length>0) {
              for(let leftover of this.leftovers){
                const leftoverId = parseInt(leftover.leftover_id, 10);
                this.quantities[leftoverId] = 1;
                console.log('initial value:', this.quantities[leftoverId]);
              }
            }
          },
          error: (error) => {
            console.error('Error fetching Leftovers:', error);
          }
        });
    }

    goToType(type : string){
      const sessionType=[type,"ByType"]
    sessionStorage.setItem('filter',JSON.stringify(sessionType))
    this.router.navigate(['/FilterLeftovers']);
    // console.log(sessionType);
    }

    goToRestaurant(restId:number){
      const sessionRestaurant=[restId,"byRestaurant"]
    sessionStorage.setItem('filter',JSON.stringify(sessionRestaurant))
    this.router.navigate(['/FilterLeftovers']);
    console.log('from view',restId);
    }
    // getLeftoversByType(orgId:number){
    //   this.http.get<any>(`http://localhost:3000/leftovers/searchLeftovers/${orgId}`)
    //     .subscribe({
    //       next: (response: any) => {
    //         console.log('Response from server leftovers:', response);
    //         // this.profile = response // Assign response to allFeedbacks
    //         // console.log('logo:',this.profile)
    //       },
    //       error: (error) => {
    //         console.error('Error fetching Leftovers:', error);
    //       }
    //     });

    // }

    }
  

  // async getAllLeftovers(orgId:any){
  //     try {
  //       const response = await this.http.get<any>(`http://localhost:3000/search/${orgId}`).toPromise();
  //       console.log('Response from server:', response);
  //       // this.profile = response; // Assign response to allFeedbacks
  //       // console.log('logo:', this.profile);
  //     } catch (error) {
  //       console.error('Error fetching Leftovers:', error);
  //     }
  //   }
    
  
  
  // extractImageFilename(fullImagePath: string): string {
  //   // Split the full image path by '\' or '/'
  //   const pathSegments = fullImagePath.split(/[\\/]/);
  //   // The filename will be the last segment
  //   return pathSegments[pathSegments.length - 1];
  // }

  // fetchLeftovers(): void {
  //   this.globalService.fetchLeftovers()
  //     .subscribe({
  //       next: (response: any[]) => {
  //         this.leftovers = response;
  //       },
  //       error: (error) => {
  //         console.error('Error fetching leftovers:', error);
  //       }
  //     });
    
  //   }

  //   onDeleteLeftover(id: string) {
  //     this.http.delete(`http://localhost:2995/api/leftovers/${id}`).subscribe(
  //       () => {
  //         console.log(`Leftover with ID ${id} deleted successfully`);
  //         // Refresh the list of leftovers after successful deletion
  //         this.fetchLeftovers();
  //       },
  //       (error) => {
  //         console.error('Error deleting leftover:', error);
  //         // Handle error
  //       }
  //     );
  //     document.getElementById(id).remove();
  //   }
    
    
  // fetchLeftovers(): void {
  //   this.http.get<any[]>('http://localhost:2995/api/leftovers/active')
  //     .subscribe({
  //       next: (response: any[]) => {
  //         this.leftovers = response;
  //       },
  //       error: (error) => {
  //         console.error('Error fetching leftovers:', error);
  //         // Handle error
  //       }
  //     });
  // }



  // async fetchLeftovers() {
  //   try {
  //     const response = await this.http.get<any[]>('http://localhost:2995/api/leftovers/active').toPromise();
  //     if (response) {
  //       this.leftovers = response;
  //     }
  //   } catch (error) {
  //     console.error('Error fetching leftovers:', error);
  //     // Handle error
  //   }
  // }



