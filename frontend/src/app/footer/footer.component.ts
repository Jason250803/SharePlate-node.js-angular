import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {

  contactUs(){
    const recipient = 'shareplate24@gmail.com';
    const mailtoLink = `mailto:${recipient}`;
    window.location.href = mailtoLink;
  }
}
