import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Observable} from 'rxjs/Rx';

var wgxpath = require('wgxpath');
var jquery = require('jquery');

@Injectable()
export class MealProviderDetailService {
   public name: string = 'MealProviderDetailService';

   constructor(private http:Http) {
   }

  public resolveXPath(url: string, xpath: string):Observable<string> {
    return this.http.get(url).map((resp)=>{
        var fragment = jquery.parseHTML(resp.text());
        wgxpath.install(window);
        var result = window.document.evaluate(xpath, fragment[0], null, wgxpath.XPathResultType.STRING_TYPE, null);
        return result.stringValue;
    });
  }
}
