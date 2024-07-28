import { Leftover } from './../module/leftovers';
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-filter-leftovers',
  templateUrl: './filter-leftovers.component.html',
  styleUrls: ['./filter-leftovers.component.css']
})
export class FilterLeftoversComponent {

  filterSession: any[];
  sessionData:any;
  userId:any;

  // restaurantSession:any;

  typeLeftovers:any;
  restaurantLeftovers:any;

  // maxQtity:number=;
  // quantity: number = 1; 

  quantities: { [key: number]: number } = {};

  notification: string | null = null;
  shownotification:boolean= false ;

  basketLeftovers:any;

  constructor(private http: HttpClient,private router:Router) { }

  ngOnInit() {


    new BehaviorSubject(sessionStorage.getItem('filter') ?? '{}').subscribe(
      (type) => {
        this.filterSession = JSON.parse(type);
        console.log('filter :', this.filterSession)
        
      });

      new BehaviorSubject(sessionStorage.getItem('sessionData') ?? '{}').subscribe(
        (data) => {
          this.sessionData = JSON.parse(data);
          this.userId=this.sessionData.session.user.account_id
        } );
        if(this.filterSession[1]==="ByType")
       this.filterByType(this.userId,this.filterSession[0])

      else if(this.filterSession[1]=="byRestaurant")
      this.filterByRestaurant(this.filterSession[0])

      this.getBasketLeftovers();
      console.log('n2br:',this.userId);

      // this.typeLeftovers?.forEach(leftover => {
      //   this.quantities[leftover.leftover_id] = 0; 
      //   console.log('initial value:',this.quantities[leftover.leftover_id])
      // });

      
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
           console.log("qtity in baske",leftover.bquantity)
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

     this.http.post(`http://localhost:3000/cart/${this.userId}`, data)
       .subscribe(response => {
         console.log('Leftover added successfully:', response);
         alert("Leftover added to the basket");
         this.getBasketLeftovers();
       }, error => {
         console.error('Error adding Leftover:', error);
       });
   }
 }
}
}



  getBasketLeftovers(){

    this.http.get<any>(`http://localhost:3000/cart/${this.userId}`)
    .subscribe({
      next: (response: any) => {
        console.log('Response from server all leftovers:', response);
        this.basketLeftovers = response;
      },
      error: (error) => {
        console.error('Error fetching leftovers:', error);
      }
    });
  }
 
  

  filterByType(userId:number,type: string) {
    console.log('in function:',type)
    this.http.get<any>(`http://localhost:3000/restaurants/searchLeftovers/${userId}?type=${type}`)
      .subscribe({
        next: (response: any) => {
          console.log('Response from server leftovers by type:', response);
          this.typeLeftovers=response;
          if (this.typeLeftovers && this.typeLeftovers.length>0) {
            for(let leftover of this.typeLeftovers){
              const leftoverId = parseInt(leftover.leftover_id, 10);
              this.quantities[leftoverId] = 1;
              console.log('initial value:', this.quantities[leftoverId]);
            }
          }
        },
        error: (error) => {
          console.error('Error fetching leftovers by type:', error);
        }
      });
  }

  backToTypes(){
    
    this.router.navigate(['./ViewLeftovers']);
    // sessionStorage.removeItem('type');
  }

  filterByRestaurant(restaurantId :number){
    console.log('rest id:',restaurantId)
    this.http.get<any>(`http://localhost:3000/leftovers/active/restaurant/${restaurantId}`)
      .subscribe({
        next: (response: any) => {
          console.log('Response from server leftovers by restaurant:', response);
          this.restaurantLeftovers=response;
          if (this.restaurantLeftovers && this.restaurantLeftovers.length>0) {
            for(let leftover of this.restaurantLeftovers){
              const leftoverId = parseInt(leftover.leftover_id, 10);
              this.quantities[leftoverId] = 1;
              console.log('initial value:', this.quantities[leftoverId]);
            }
          }
        },
        error: (error) => {
          console.error('Error fetching leftovers by restaurant:', error);
        }
      });
  }
  backToRestaurant(){
    // sessionStorage.removeItem('restaurantId');
    this.router.navigate(['./ViewLeftovers'])
  }
}





