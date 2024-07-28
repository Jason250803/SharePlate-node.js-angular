import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

interface CartItem {
  basket_item_id: number;
  bquantity: number;
  user_name: string;
  leftover_image_path: string;
  type: string;
  name: string;
  quantity: number;
  expiry_date: string;
  status: number;
  restaurant_id: number;
  address: string;
}

interface GroupedCartItems {
  [key: string]: CartItem[];
}

@Component({
  selector: 'app-basket',
  templateUrl: './basket.component.html',
  styleUrls: ['./basket.component.css']
})
export class BasketComponent implements OnInit {
  cartItems: CartItem[] = [];
  sessionData: any;
  selectedDate: { [key: string]: string } = {};
  selectedTime: { [key: string]: string } = {};
  quantities: { [key: number]: number } = {};
  minDate: string; // Minimum date for date inputs
  maxDates: { [key: string]: string } = {}; // Maximum dates for each restaurant

  groupedCartItems: GroupedCartItems = {};
  isCartEmpty: boolean = true;
  account_id: number;

  constructor(private http: HttpClient, private datePipe: DatePipe, private router: Router) { }

  ngOnInit(): void {
    console.log('Initializing component...'); // Debugging
    this.fetchCartItems();
    // Initialize minDate to today's date
    this.minDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd')!;

    new BehaviorSubject(sessionStorage.getItem('sessionData') ?? '{}').subscribe(
      (data) => {
        this.sessionData = JSON.parse(data);
        this.account_id = this.sessionData.session.user.account_id;
        console.log('Session data loaded:', this.sessionData); // Debugging
      });
  }

  fetchCartItems(): void {
    console.log('Fetching cart items...'); // Debugging
    new BehaviorSubject(sessionStorage.getItem("sessionData") ?? '{}').subscribe(
      (data) => {
        this.sessionData = JSON.parse(data);
      }
    );

    const userId = this.sessionData.session.user.account_id;
    this.http.get<CartItem[]>(`http://localhost:3000/cart/${userId}`).subscribe(
      (cartItems) => {
        const filteredCartItems = cartItems.filter(item => item.user_name !== null);
        this.cartItems = filteredCartItems.sort((a, b) => a.user_name.localeCompare(b.user_name));
        this.groupedCartItems = this.groupCartItemsByRestaurant(this.cartItems);
        this.initializeQuantities();
        console.log('Cart items loaded:', this.cartItems); // Debugging
        console.log('Grouped cart items:', this.groupedCartItems); // Debugging

        // Check and update bquantity if it exceeds available quantity
        this.cartItems.forEach(item => {
          if (item.bquantity > item.quantity) {
            this.quantities[item.basket_item_id] = item.quantity;
            this.saveChanges(item.basket_item_id);
          }
        });

        // Call getFirstExpirationDates here to see the output on page load
        const firstExpirationDates = this.getFirstExpirationDates();
        console.log('First expiration dates on page load:', firstExpirationDates); // Debugging
        
        // Set maxDates based on firstExpirationDates
        Object.keys(firstExpirationDates).forEach(restaurant => {
          this.maxDates[restaurant] = this.datePipe.transform(firstExpirationDates[restaurant], 'yyyy-MM-dd')!;
        });
        this.isCartEmpty = this.cartItems.length === 0;
              
      },
      (error) => {
        console.error('Error fetching cart items:', error);
      }
    );
  }

  initializeQuantities(): void {
    this.cartItems.forEach(item => {
      this.quantities[item.basket_item_id] = item.bquantity;
    });
  }

  groupCartItemsByRestaurant(cartItems: CartItem[]): GroupedCartItems {
    return cartItems.reduce((acc: GroupedCartItems, currentItem) => {
      const restaurantName = currentItem.user_name;
      if (!acc[restaurantName]) {
        acc[restaurantName] = [];
      }
      acc[restaurantName].push(currentItem);
      return acc;
    }, {});
  }

  increment(leftoverId: number) {
    const item = this.cartItems.find(cartItem => cartItem.basket_item_id === leftoverId);
    if (item && this.quantities[leftoverId] < item.quantity) {
      this.quantities[leftoverId]++;
    }
      //this.saveChanges(leftoverId);
    // } else if(this.quantities[leftoverId]<=0){
    //   alert('Quantity cannot be 0 or negative');
    // }
    else{
      alert('Quantity cannot exceed available quantity');
    }
  }

  decrement(leftoverId: number) {
    if (this.quantities[leftoverId] > 1) {
      this.quantities[leftoverId]--;
      //this.saveChanges(leftoverId);
    }
  }

  updateQuantity(event: Event, leftoverId: number) {
    const target = event.target as HTMLInputElement;
    const parsedValue = parseInt(target.value, 10);
    const item = this.cartItems.find(cartItem => cartItem.basket_item_id === leftoverId);
    if (!isNaN(parsedValue) && item) {
      if (parsedValue <= item.quantity) {
        this.quantities[leftoverId] = parsedValue;
        //this.saveChanges(leftoverId);
      } 
      else {
        alert('Cannot exceed available quantity');
        this.quantities[leftoverId] = item.quantity; // Reset to max available quantity
      }
    }
    if (!isNaN(parsedValue) && item) {
      if(parsedValue<1){
        alert('cannot be 0 or negative quantity')
        this.quantities[leftoverId]=1;
      }
    }
  }

  removeItem(itemId: number): void {
    this.http.delete<any>(`http://localhost:3000/cart/${itemId}`).subscribe(
      () => {
        this.cartItems = this.cartItems.filter(item => item.basket_item_id !== itemId);
        this.groupedCartItems = this.groupCartItemsByRestaurant(this.cartItems);
        console.log('Cart item removed. Updated cart items:', this.cartItems); // Debugging
        console.log('Updated grouped cart items:', this.groupedCartItems); // Debugging
        location.reload();
      },
      (error) => {
        console.error('Error removing cart item:', error);
      }
    );
  }

  saveChanges(basketItemId: number) {
    const item = this.cartItems.find(cartItem => cartItem.basket_item_id === basketItemId);
    if (item) {
      this.http.put<any>(`http://localhost:3000/cart/${basketItemId}`, { reservedQuantity: this.quantities[basketItemId] })
        .subscribe(
          () => {
            console.log('Cart item updated successfully');
          },
          (error) => {
            console.error('Error updating cart item:', error);
          }
        );
    }
  }

  getFirstExpirationDates(): { [key: string]: string } {
    const firstExpirationDates: { [key: string]: string } = {};

    for (const [restaurant, items] of Object.entries(this.groupedCartItems)) {
      const earliestItem = items.reduce((earliest, current) => {
        return new Date(current.expiry_date) < new Date(earliest.expiry_date) ? current : earliest;
      }, items[0]);
      firstExpirationDates[restaurant] = earliestItem.expiry_date;
    }

    console.log("First expiration dates:", firstExpirationDates); // Debugging
    return firstExpirationDates;
  }

  validateReservationDates(): boolean {
    const firstExpirationDates = this.getFirstExpirationDates();
  
    for (const restaurant in this.selectedDate) {
      const selectedDate = new Date(this.selectedDate[restaurant]);
      const firstExpirationDate = new Date(firstExpirationDates[restaurant]);
  
      console.log(`Selected date for ${restaurant}:`, selectedDate); // Debugging
      console.log(`First expiration date for ${restaurant}:`, firstExpirationDate); // Debugging
  
      if (!this.selectedDate[restaurant] || !this.selectedTime[restaurant]) {
        alert(`Please select both date and time for ${restaurant}.`);
        return false;
      }
      const formattedFirstExpiryDate = new Date(firstExpirationDate).toISOString().split('T')[0];
      if (selectedDate > firstExpirationDate) {
        alert(`Reservation date for ${restaurant} cannot be later than ${formattedFirstExpiryDate}`);
        return false;
      }
    }
  
    // Additional check to ensure all restaurants have their dates and times filled
    const restaurantNames = Object.keys(this.groupedCartItems);
    for (const restaurant of restaurantNames) {
      if (!this.selectedDate[restaurant] || !this.selectedTime[restaurant]) {
        alert(`Please select both date and time for ${restaurant}.`);
        return false;
      }
    }
  
    return true;
  }
  

  async confirmCart(): Promise<void> {
    console.log('Confirming cart...'); // Debugging
    if (!this.validateReservationDates()) {
        console.log('Reservation date validation failed.'); // Debugging
        return;
    }

    try {
        console.log('Calling confirmCart function'); // Add this line
        const userId = this.sessionData.session.user.account_id;
        const pickupDates: string[] = Object.values(this.selectedDate);
        const pickupTimes: string[] = Object.values(this.selectedTime);
        const leftoversList: { restaurantId: number, leftoverId: number }[] = [];

        Object.values(this.groupedCartItems).forEach((cartItems: CartItem[]) => {
            cartItems.forEach((item: CartItem) => {
                leftoversList.push({ restaurantId: item.restaurant_id, leftoverId: item.basket_item_id });
            });
        });

        const payload = { pickupDates, pickupTimes, leftoversList };
        console.log('Payload for cart confirmation:', payload); // Debugging

        await this.http.post(`http://localhost:3000/cart/confirm/${userId}`, payload).toPromise();
        console.log('Cart confirmed successfully');

        alert('Cart confirmed successfully!');
        window.location.reload(); // Reload the page after confirmation
    } catch (error) {
        console.error('Error confirming cart:', error);
        alert('An error occurred while confirming the cart. Please try again.');
    }
}

  
  backToViewLeftovers() {
    this.router.navigate(['/ViewLeftovers']);
  }
}

































// import { Component, OnInit } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { DatePipe } from '@angular/common';
// import { Router } from '@angular/router';
// import { BehaviorSubject } from 'rxjs';

// interface CartItem {
//   basket_item_id: number;
//   bquantity: number;
//   user_name: string;
//   leftover_image_path: string;
//   type: string;
//   name: string;
//   quantity: number;
//   expiry_date: string;
//   status: number;
//   restaurant_id: number;
//   address: string;
// }

// interface GroupedCartItems {
//   [key: string]: CartItem[];
// }



// @Component({
//   selector: 'app-basket',
//   templateUrl: './basket.component.html',
//   styleUrls: ['./basket.component.css']
// })
// export class BasketComponent implements OnInit {
//   cartItems: CartItem[] = [];
//   sessionData: any;
//   selectedDate: { [key: string]: string } = {};
//   selectedTime: { [key: string]: string } = {};
//   quantities: { [key: number]: number } = {};
//   minDate: string; // Minimum date for date inputs
//   maxDates: { [key: string]: string } = {}; // Maximum dates for each restaurant

//   groupedCartItems: GroupedCartItems = {};
//   isCartEmpty: boolean = true;
//   account_id: number;

//   constructor(private http: HttpClient, private datePipe: DatePipe, private router: Router) { }

//   ngOnInit(): void {
//     console.log('Initializing component...'); // Debugging
//     this.fetchCartItems();
//     // this.checkIfCartIsEmpty();

//     // Initialize minDate to today's date
//     this.minDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd')!;

//     new BehaviorSubject(sessionStorage.getItem('sessionData') ?? '{}').subscribe(
//       (data) => {
//         this.sessionData = JSON.parse(data);
//         this.account_id = this.sessionData.session.user.account_id;
//         console.log('Session data loaded:', this.sessionData); // Debugging
//       });
//   }

//   fetchCartItems(): void {
//     console.log('Fetching cart items...'); // Debugging
//     new BehaviorSubject(sessionStorage.getItem("sessionData") ?? '{}').subscribe(
//       (data) => {
//         this.sessionData = JSON.parse(data);
//       }
//     );

//     const userId = this.sessionData.session.user.account_id;
//     this.http.get<CartItem[]>(`http://localhost:3000/cart/${userId}`).subscribe(
//       (cartItems) => {
//         const filteredCartItems = cartItems.filter(item => item.user_name !== null);
//         this.cartItems = filteredCartItems.sort((a, b) => a.user_name.localeCompare(b.user_name));
//         this.groupedCartItems = this.groupCartItemsByRestaurant(this.cartItems);
//         this.initializeQuantities();
//         console.log('Cart items loaded:', this.cartItems); // Debugging
//         console.log('Grouped cart items:', this.groupedCartItems); // Debugging

//         // Check and update bquantity if it exceeds available quantity
//         this.cartItems.forEach(item => {
//           if (item.bquantity > item.quantity) {
//             this.quantities[item.basket_item_id] = item.quantity;
//             this.saveChanges(item.basket_item_id);
//           }
//         });

//         // Call getFirstExpirationDates here to see the output on page load
//         const firstExpirationDates = this.getFirstExpirationDates();
//         console.log('First expiration dates on page load:', firstExpirationDates); // Debugging
        
//         // Set maxDates based on firstExpirationDates
//         Object.keys(firstExpirationDates).forEach(restaurant => {
//           this.maxDates[restaurant] = this.datePipe.transform(firstExpirationDates[restaurant], 'yyyy-MM-dd')!;
//         });
//         this.isCartEmpty = this.cartItems.length === 0;
//       },
//       (error) => {
//         console.error('Error fetching cart items:', error);
//       }
//     );
//   }

//   // checkIfCartIsEmpty() {
//   //   this.isCartEmpty = Object.keys(this.groupedCartItems).length === 0;
//   // }

//   initializeQuantities(): void {
//     this.cartItems.forEach(item => {
//       this.quantities[item.basket_item_id] = item.bquantity;
//     });
//   }

//   groupCartItemsByRestaurant(cartItems: CartItem[]): GroupedCartItems {
//     return cartItems.reduce((acc: GroupedCartItems, currentItem) => {
//       const restaurantName = currentItem.user_name;
//       if (!acc[restaurantName]) {
//         acc[restaurantName] = [];
//       }
//       acc[restaurantName].push(currentItem);
//       return acc;
//     }, {});
//   }

//   increment(leftoverId: number) {
//     const item = this.cartItems.find(cartItem => cartItem.basket_item_id === leftoverId);
//     if (item && this.quantities[leftoverId] < item.quantity) {
//       this.quantities[leftoverId]++;
//       //this.saveChanges(leftoverId);
//     } else {
//       alert('Cannot exceed available quantity');
//     }
//   }

//   decrement(leftoverId: number) {
//     if (this.quantities[leftoverId] > 1) {
//       this.quantities[leftoverId]--;
//       //this.saveChanges(leftoverId);
//     }
//   }

//   updateQuantity(event: Event, leftoverId: number) {
//     const target = event.target as HTMLInputElement;
//     const parsedValue = parseInt(target.value, 10);
//     const item = this.cartItems.find(cartItem => cartItem.basket_item_id === leftoverId);
//     if (!isNaN(parsedValue) && item) {
//       if (parsedValue <= item.quantity) {
//         this.quantities[leftoverId] = parsedValue;
//         this.saveChanges(leftoverId);
//       } else {
//         alert('Cannot exceed available quantity');
//         this.quantities[leftoverId] = item.quantity; // Reset to max available quantity
//       }
//     }
//   }

//   removeItem(itemId: number): void {
//     this.http.delete<any>(`http://localhost:3000/cart/${itemId}`).subscribe(
//       () => {
//         this.cartItems = this.cartItems.filter(item => item.basket_item_id !== itemId);
//         this.groupedCartItems = this.groupCartItemsByRestaurant(this.cartItems);
//         console.log('Cart item removed. Updated cart items:', this.cartItems); // Debugging
//         console.log('Updated grouped cart items:', this.groupedCartItems); // Debugging
//         location.reload();
//       },
//       (error) => {
//         console.error('Error removing cart item:', error);
//       }
//     );
//   }

//   saveChanges(basketItemId: number) {
//     const item = this.cartItems.find(cartItem => cartItem.basket_item_id === basketItemId);
//     if (item) {
//       this.http.put<any>(`http://localhost:3000/cart/${basketItemId}`, { reservedQuantity: this.quantities[basketItemId] })
//         .subscribe(
//           () => {
//             console.log('Cart item updated successfully');
//           },
//           (error) => {
//             console.error('Error updating cart item:', error);
//           }
//         );
//     }
//   }

//   getFirstExpirationDates(): { [key: string]: string } {
//     const firstExpirationDates: { [key: string]: string } = {};

//     for (const [restaurant, items] of Object.entries(this.groupedCartItems)) {
//       const earliestItem = items.reduce((earliest, current) => {
//         return new Date(current.expiry_date) < new Date(earliest.expiry_date) ? current : earliest;
//       }, items[0]);
//       firstExpirationDates[restaurant] = earliestItem.expiry_date;
//     }

//     console.log("First expiration dates:", firstExpirationDates); // Debugging
//     return firstExpirationDates;
//   }

//   validateReservationDates(): boolean {
//     const firstExpirationDates = this.getFirstExpirationDates();
  
//     for (const restaurant in this.selectedDate) {
//       const selectedDate = new Date(this.selectedDate[restaurant]);
//       const firstExpirationDate = new Date(firstExpirationDates[restaurant]);
  
//       console.log(`Selected date for ${restaurant}:`, selectedDate); // Debugging
//       console.log(`First expiration date for ${restaurant}:`, firstExpirationDate); // Debugging
  
//       if (!this.selectedDate[restaurant] || !this.selectedTime[restaurant]) {
//         alert(`Please select both date and time for ${restaurant}.`);
//         return false;
//       }
  
//       if (selectedDate > firstExpirationDate) {
//         alert(`Reservation date for ${restaurant} cannot be earlier than ${firstExpirationDates[restaurant]}`);
//         return false;
//       }
//     }
  
//     // Additional check to ensure all restaurants have their dates and times filled
//     const restaurantNames = Object.keys(this.groupedCartItems);
//     for (const restaurant of restaurantNames) {
//       if (!this.selectedDate[restaurant] || !this.selectedTime[restaurant]) {
//         alert(`Please select both date and time for ${restaurant}.`);
//         return false;
//       }
//     }
  
//     return true;
//   }
  

//   async confirmCart(): Promise<void> {
//     console.log('Confirming cart...'); // Debugging
//     if (!this.validateReservationDates()) {
//         console.log('Reservation date validation failed.'); // Debugging
//         return;
//     }

//     try {
//         console.log('Calling confirmCart function'); // Add this line
//         const userId = this.sessionData.session.user.account_id;
//         const pickupDates: string[] = Object.values(this.selectedDate);
//         const pickupTimes: string[] = Object.values(this.selectedTime);
//         const leftoversList: { restaurantId: number, leftoverId: number }[] = [];

//         Object.values(this.groupedCartItems).forEach((cartItems: CartItem[]) => {
//             cartItems.forEach((item: CartItem) => {
//                 leftoversList.push({ restaurantId: item.restaurant_id, leftoverId: item.basket_item_id });
//             });
//         });

//         const payload = { pickupDates, pickupTimes, leftoversList };
//         console.log('Payload for cart confirmation:', payload); // Debugging

//         await this.http.post(`http://localhost:3000/cart/confirm/${userId}`, payload).toPromise();
//         console.log('Cart confirmed successfully');

//         alert('Cart confirmed successfully!');
//         window.location.reload(); // Reload the page after confirmation
//     } catch (error) {
//         console.error('Error confirming cart:', error);
//         alert('An error occurred while confirming the cart. Please try again.');
//     }
// }

  
//   backToViewLeftovers() {
//     this.router.navigate(['/ViewLeftovers']);
//   }
// }







// // // import { HttpClient } from '@angular/common/http';
// // // import { Component,OnInit} from '@angular/core';
// // // import { BehaviorSubject } from 'rxjs';
// // // import { Router } from '@angular/router';
// // // import { DatePipe } from '@angular/common';


// // // @Component({
// // //   selector: 'app-basket',
// // //   templateUrl: './basket.component.html',
// // //   styleUrls: ['./basket.component.css']
// // // })
// // // export class BasketComponent implements OnInit {

  
  
   

// // //   sessionData: any;
// // //   account_id: number;

// // //   quantities: { [key: number]: number } = {};

// // //   basketLeftovers:any[];

// // //   groupedLeftovers:any;


// // //   constructor(private http:HttpClient,private router:Router){}

// // //   ngOnInit() {


// // //     new BehaviorSubject(sessionStorage.getItem('sessionData') ?? '{}').subscribe(
// // //       (data) => {
// // //         this.sessionData = JSON.parse(data);
// // //         // this.role=this.sessionData.session.user.role;
// // //         console.log(this.sessionData)
// // //         this.account_id = this.sessionData.session.user.account_id;
// // //         console.log('acount id:', this.account_id)
// // //       });

// // //       this.getBasketLeftovers();
// // //   }

// // //   getBasketLeftovers(){

// // //     this.http.get<any>(`http://localhost:3000/cart/${this.account_id}`)
// // //     .subscribe({
// // //       next: (response: any) => {
// // //         console.log('Response from server all basket leftovers:', response);
// // //         this.basketLeftovers = response;
// // //         if (this.basketLeftovers && this.basketLeftovers.length>0) {
// // //           for(let leftover of this.basketLeftovers){
// // //             const leftoverId = parseInt(leftover.leftover_id, 10);
// // //             this.quantities[leftoverId] = leftover.bquantity;
// // //             console.log('initial value:', this.quantities[leftoverId]);
// // //           }
// // //         }
// // //       },
// // //       error: (error) => {
// // //         console.error('Error fetching leftovers:', error);
// // //       }
// // //     });
// // //   }


// // //   decrement(leftoverId: number) {
// // //     if (this.quantities[leftoverId] > 0)
// // //       this.quantities[leftoverId]--;

// // //   }

// // //   increment(maxQtity: number, leftoverId: number) {
// // //     if (this.quantities[leftoverId] < maxQtity)
// // //       this.quantities[leftoverId]++;
// // //   }

// // //   updateQuantity(event: Event, leftoverId: number) {
// // //     const target = event.target as HTMLInputElement;//downcast the event to target to accept the .value
// // //     const parsedValue = parseInt(target.value, 10);
// // //     if (!isNaN(parsedValue)) {
// // //       this.quantities[leftoverId] = parsedValue;

// // //     }
// // //   }

// // //   editQuantity(basketItemId:number,quantity : number){
// // //     const requestData = { reservedQuantity: quantity};
// // //     console.log("basket id:",basketItemId)
// // //     this.http.put(`http://localhost:3000/cart/${basketItemId}`,requestData)
// // //     .subscribe(response => {
// // //      console.log('Leftover edited successfully:', response);
// // //      this.getBasketLeftovers();
// // //      location.reload();
     
// // //   }, error => {
// // //   console.error('Error editing Leftover:', error);
  
// // //   });
// // // }

// // // backToViewLeftovers(){
// // //   this.router.navigate(['/ViewLeftovers']);
// // // }
  
// // // groupLeftoversByRestId() {
// // //   this.groupedLeftovers = this.basketLeftovers.reduce((groups, item) => {
// // //     const group = groups[item.restaurant_id] || [];
// // //     group.push(item);
// // //     groups[item.restaurant_id] = group;
// // //     return groups;
// // //   }, {});
// // // }
// // // }



// // import { Component, OnInit } from '@angular/core';
// // import { HttpClient } from '@angular/common/http';
// // import { BehaviorSubject } from 'rxjs';
// // import { DatePipe } from '@angular/common';
// // import { KeysPipe } from '../jeys.pipe';
// // import { Router } from '@angular/router';

// // interface CartItem {
// //   basket_item_id: number;
// //   bquantity: number;
// //   user_name: string; // Assuming this is the property for the restaurant name
// //   leftover_image_path: string; // Add leftover_image_path property
// //   type: string; // Type of the leftover (e.g., sandwiches, drinks, etc.)
// //   name: string; // Name of the leftover
// //   quantity: number; // Quantity of the leftover
// //   expiry_date: string; // Expiry date of the leftover
// //   status: number; // Status of the leftover (e.g., available, out of stock, etc.)
// //   restaurant_id: number; // ID of the restaurant
// //   address: string;
  
// // }

// // interface GroupedCartItems {
// //   [key: string]: CartItem[]; // An object with string keys, each pointing to an array of CartItems
// // }

// // @Component({
// //   selector: 'app-basket',
// //   templateUrl: './basket.component.html',
// //   styleUrls: ['./basket.component.css']
// // })
// // export class BasketComponent implements OnInit {
// //   cartItems: CartItem[] = [];
// //   sessionData: any;
// //   updatedQuantity!: number;
// //   selectedDate: { [key: string]: string } = {};
// //   selectedTime: { [key: string]: string } = {};
// //   quantities: { [key: number]: number } = {};
// //   groupedCartItems: GroupedCartItems = {};
// //   // sessionData: any;
// //    account_id: number;

// //   constructor(private http: HttpClient, private datePipe: DatePipe,private router:Router) { }

// //   ngOnInit(): void {
// //     this.fetchCartItems();

// //           new BehaviorSubject(sessionStorage.getItem('sessionData') ?? '{}').subscribe(
// //             (data) => {
// //               this.sessionData = JSON.parse(data);
// //               // this.role=this.sessionData.session.user.role;
// //               console.log(this.sessionData)
// //               this.account_id = this.sessionData.session.user.account_id;
// //               console.log('acount id:', this.account_id)
// //             });
// //   }

// //   fetchCartItems(): void {
// //     new BehaviorSubject(sessionStorage.getItem("sessionData") ?? '{}').subscribe(
// //       (data) => {
// //         this.sessionData = JSON.parse(data);
// //       }
// //     );

// //     const userId = this.sessionData.session.user.account_id;
// //     this.http.get<CartItem[]>(`http://localhost:3000/cart/${userId}`).subscribe(
// //       (cartItems) => {
// //         // Filter out items with null user_name
// //         const filteredCartItems = cartItems.filter(item => item.user_name !== null);
  
// //         // Sort the filtered cart items by user_name
// //         this.cartItems = filteredCartItems.sort((a, b) => {
// //           if (a.user_name && b.user_name) {
// //             return a.user_name.localeCompare(b.user_name);
// //           }
// //           // Handle case where user_name is null for one of the items
// //           return 0;
// //         });

// //         // Group cart items by restaurant name
// //         this.groupedCartItems = this.groupCartItemsByRestaurant(this.cartItems);
// //       },
// //       (error) => {
// //         console.error('Error fetching cart items:', error);
// //         // Handle error, maybe show an error message to the user
// //       }
// //     );
// //   }

// //   groupCartItemsByRestaurant(cartItems: CartItem[]): GroupedCartItems {
// //     return cartItems.reduce((acc: GroupedCartItems, currentItem) => {
// //       const restaurantName = currentItem.user_name;
// //       if (!acc[restaurantName]) {
// //         acc[restaurantName] = [];
// //       }
// //       acc[restaurantName].push(currentItem);
// //       return acc;
// //     }, {});
// //   }

// //   //  maxQtity: number = 10;
// //   // quantity: number = 1;

// //   increment(maxQtity: number, leftoverId: number) {
// //         if (this.quantities[leftoverId] < maxQtity)
// //           this.quantities[leftoverId]++;
// //       }


// //   // increment(item: any) {
// //   //   if (item.bquantity < this.maxQtity) {
// //   //     item.bquantity++;
// //   //     this.updatedQuantity = item.bquantity; // Update the updatedQuantity property
// //   //   }
// //   // }

// //   decrement(leftoverId: number) {
// //         if (this.quantities[leftoverId] > 1)
// //           this.quantities[leftoverId]--;
    
// //       }

// //       updateQuantity(event: Event, leftoverId: number) {
// //             const target = event.target as HTMLInputElement;//downcast the event to target to accept the .value
// //             const parsedValue = parseInt(target.value, 10);
// //             if (!isNaN(parsedValue)) {
// //               this.quantities[leftoverId] = parsedValue;
        
// //             }
// //           }


// //       // updateQuantity(event: Event) {
// //       //   const target = event.target as HTMLInputElement; // Downcast the event to target to accept the .value
// //       //   const parsedValue = parseInt(target.value, 10);
// //       //   // if (!isNaN(parsedValue)) {
// //       //   this.quantity = parsedValue;
// //       //   // }
// //       // }
    
// //   // decrement(item: any) {
// //   //   if (item.bquantity > 1) {
// //   //     item.bquantity--;
// //   //     this.updatedQuantity = item.bquantity; // Update the updatedQuantity property
// //   //   }
// //   // }

// //   removeItem(itemId: number): void {
// //     this.http.delete<any>(`http://localhost:3000/cart/${itemId}`).subscribe(
// //       () => {
// //         console.log('Cart item removed successfully');
// //         // Remove the item from the cartItems array in the frontend
// //         this.cartItems = this.cartItems.filter(item => item.basket_item_id !== itemId);
// //       },
// //       (error) => {
// //         console.error('Error removing cart item:', error);
// //         // Handle error, maybe show an error message to the user
// //       }
// //     );
// //   }

// //   saveChanges(item: any) {
// //     this.http.put<any>(`http://localhost:3000/cart/${item.basket_item_id}`, { reservedQuantity: this.updatedQuantity })
// //       .subscribe(
// //         () => {
// //           console.log('Cart item updated successfully');
// //           // Optionally, you can update the local cart items array or perform any other action upon successful update
// //         },
// //         (error) => {
// //           console.error('Error updating cart item:', error);
// //           // Handle error, maybe show an error message to the user
// //         }
// //       );
// //   }

// //   async confirmCart(): Promise<void> {
// //     try {
// //       const userId = this.sessionData.session.user.account_id;
  
// //       const pickupDates: string[] = Object.values(this.selectedDate);
// //       const pickupTimes: string[] = Object.values(this.selectedTime);
  
// //       const leftoversList: { restaurantId: number, leftoverId: number }[] = [];
  
// //       Object.values(this.groupedCartItems).forEach((cartItems: CartItem[]) => {
// //         cartItems.forEach((item: CartItem) => {
// //           leftoversList.push({ restaurantId: item.restaurant_id, leftoverId: item.basket_item_id });
// //         });
// //       });
  
// //       const payload = { pickupDates, pickupTimes, leftoversList };
  
// //       await this.http.post(`http://localhost:3000/cart/confirm/${userId}`, payload).toPromise();
      
// //       // If successful, send success message or perform any other action
// //       console.log('Cart confirmed successfully');
// //     } catch (error) {
// //       // If an error occurs, log the error and display an error message
// //       console.error('Error confirming cart:', error);
// //       // Handle error, maybe show an error message to the user
// //     }
// //   }

  
// //   backToViewLeftovers(){
// //   this.router.navigate(['/ViewLeftovers']);
// // }
// // }