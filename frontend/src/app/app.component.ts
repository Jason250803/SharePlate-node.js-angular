import { Component,OnInit } from '@angular/core';
import{Router}from'@angular/router';
// import { GlobalService } from './global.service';
// import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'SHAREPLATE';
  images : string[]= [
    './assets/pic2.jpeg',
  './assets/pic1.jpeg',
  './assets/bg3.jpeg'
  ]
  currentImageIndex=0;
  currentImage = this.images[this.currentImageIndex];
  constructor(private router:Router){};

 ngOnInit(){

  
  setInterval(() => {
    this.changeImage();
  }, 2000);
}
isHome():boolean{
  
        return this.router.url=='/Home';
    
}
  
  // changeImage() :void{ 
  //   this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
  //   this.currentImage = this.images[this.currentImageIndex];
  changeImage(): void {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
    this.currentImage = this.images[this.currentImageIndex];
  }
  
  }

