import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CountryServiceService {
  public baseUrl: string = 'https://restcountries.com/v3.1/all';

  constructor(private http: HttpClient) { }

  getCountries(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl).pipe(
      map(countries => countries
        .filter(country => country.name && country.name.common && country.cca2 && country.flags && country.flags.png && country.idd && country.idd.root && country.idd.suffixes && country.idd.suffixes[0])
        .map(country => ({
          name: country.name.common,
          cca2: country.cca2,
          flag: country.flags.png,
          phoneCode: country.idd.root + country.idd.suffixes[0]
        }))
        .sort((a, b) => a.name.localeCompare(b.name)) // Sorting alphabetically by country name
      )
    );
  }
}