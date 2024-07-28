import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private router: Router) {}

  private getRole(): number {
    const sessionData = JSON.parse(sessionStorage.getItem('sessionData') ?? '{}');
    return sessionData.session?.user?.role;
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    if (this.getRole() === 1) {
      return true;
    } else {
      this.router.navigate(['/']);
      return false;
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class OrgGuard implements CanActivate {
  constructor(private router: Router) {}

  private getRole(): number {
    const sessionData = JSON.parse(sessionStorage.getItem('sessionData') ?? '{}');
    return sessionData.session?.user?.role;
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    if (this.getRole() === 3) {
      return true;
    } else {
      this.router.navigate(['/']);
      return false;
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class RestGuard implements CanActivate {
  constructor(private router: Router) {}

  private getRole(): number {
    const sessionData = JSON.parse(sessionStorage.getItem('sessionData') ?? '{}');
    return sessionData.session?.user?.role;
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const role = this.getRole();
    if (role === 2 || role === 3) {
      return true;
    } else {
      this.router.navigate(['/']);
      return false;
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class CombinedGuard implements CanActivate {
  constructor(private router: Router) {}

  private getRole(): number {
    const sessionData = JSON.parse(sessionStorage.getItem('sessionData') ?? '{}');
    return sessionData.session?.user?.role;
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const role = this.getRole();
    if (role === 2 || role === 3) {
      return true;
    } else {
      this.router.navigate(['/']);
      return false;
    }
  }
}











// import { Injectable } from '@angular/core';
// import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
// import { Observable, BehaviorSubject } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class RoleGuardService {
//   private sessionData: any;
//   private role: number;

//   constructor(private router: Router) {
//     new BehaviorSubject(sessionStorage.getItem('sessionData') ?? '{}').subscribe(
//       (data) => {
//         this.sessionData = JSON.parse(data);
//         this.role = this.sessionData.session?.user?.role;
//       }
//     );
//   }

//   isAdmin(): boolean {
//     return this.role === 1;
//   }

//   isOrg(): boolean {
//     return this.role === 3;
//   }

//   isRest(): boolean {
//     return this.role === 2 || this.role === 3;
//   }

//   isOrgOrRest(): boolean {
//     return this.role === 2 || this.role === 3;
//   }
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class AdminGuard implements CanActivate {

//   constructor(private roleGuardService: RoleGuardService, private router: Router) {}

//   canActivate(
//     next: ActivatedRouteSnapshot,
//     state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
//     if (this.roleGuardService.isAdmin()) {
//       return true;
//     } else {
//       this.router.navigate(['/']);
//       return false;
//     }
//   }
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class OrgGuard implements CanActivate {

//   constructor(private roleGuardService: RoleGuardService, private router: Router) {}

//   canActivate(
//     next: ActivatedRouteSnapshot,
//     state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
//     if (this.roleGuardService.isOrg()) {
//       return true;
//     } else {
//       this.router.navigate(['/']);
//       return false;
//     }
//   }
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class RestGuard implements CanActivate {

//   constructor(private roleGuardService: RoleGuardService, private router: Router) {}

//   canActivate(
//     next: ActivatedRouteSnapshot,
//     state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
//     if (this.roleGuardService.isRest()) {
//       return true;
//     } else {
//       this.router.navigate(['/']);
//       return false;
//     }
//   }
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class CombinedGuard implements CanActivate {

//   constructor(private roleGuardService: RoleGuardService, private router: Router) {}

//   canActivate(
//     next: ActivatedRouteSnapshot,
//     state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
//     if (this.roleGuardService.isOrgOrRest()) {
//       return true;
//     } else {
//       this.router.navigate(['/']);
//       return false;
//     }
//   }
// }















// import { Injectable } from '@angular/core';
// import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
// import { Observable, BehaviorSubject } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class RoleGuardService {
//   private sessionData: any;
//   private role: number;

//   constructor(private router: Router) {
//     new BehaviorSubject(sessionStorage.getItem('sessionData') ?? '{}').subscribe(
//       (data) => {
//         this.sessionData = JSON.parse(data);
//         this.role = this.sessionData.session?.user?.role;
//       }
//     );
//   }

//   isAdmin(): boolean {
//     return this.role === 1;
//   }

//   isOrg(): boolean {
//     return this.role === 3;
//   }

//   isRest(): boolean {
//     return this.role === 2 || this.role === 3;
//   }

//   isOrgOrRest(): boolean {
//     return this.role === 2 || this.role === 3;
//   }
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class AdminGuard implements CanActivate {

//   constructor(private roleGuardService: RoleGuardService, private router: Router) {}

//   canActivate(
//     next: ActivatedRouteSnapshot,
//     state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
//     if (this.roleGuardService.isAdmin()) {
//       return true;
//     } else {
//       this.router.navigate(['/']);
//       return false;
//     }
//   }
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class OrgGuard implements CanActivate {

//   constructor(private roleGuardService: RoleGuardService, private router: Router) {}

//   canActivate(
//     next: ActivatedRouteSnapshot,
//     state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
//     if (this.roleGuardService.isOrg()) {
//       return true;
//     } else {
//       this.router.navigate(['/']);
//       return false;
//     }
//   }
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class RestGuard implements CanActivate {

//   constructor(private roleGuardService: RoleGuardService, private router: Router) {}

//   canActivate(
//     next: ActivatedRouteSnapshot,
//     state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
//     if (this.roleGuardService.isRest()) {
//       return true;
//     } else {
//       this.router.navigate(['/']);
//       return false;
//     }
//   }
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class CombinedGuard implements CanActivate {

//   constructor(private roleGuardService: RoleGuardService, private router: Router) {}

//   canActivate(
//     next: ActivatedRouteSnapshot,
//     state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
//     if (this.roleGuardService.isOrgOrRest()) {
//       return true;
//     } else {
//       this.router.navigate(['/']);
//       return false;
//     }
//   }
// }
