import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TypesService {

  constructor() { }

  types=[
    {name:'Pasta',img_path:"./assets/types/pastatype.png",itemsid:"type1"},
    {name:'Pizza',img_path:"./assets/types/pizzatype.png",itemsid:"type2"},
    {name:'Chicken',img_path:"./assets/types/chickentype.png",itemsid:"type3"},
    {name:'Beef',img_path:"./assets/types/beeftype.png",itemsid:"type4"},
    {name:'sandwiches',img_path:"./assets/types/sandwichtype.png",itemsid:"type5"},
    {name:'Desserts',img_path:"./assets/types/desserttype.png",itemsid:"type6"},  
  ]
}
