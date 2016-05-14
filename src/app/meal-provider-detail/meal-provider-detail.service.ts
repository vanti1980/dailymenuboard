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

  public resolveXPaths(url: string, ...xpaths: string[]):Observable<{[key:string]:string}> {
    return this.http.get(url).map((resp)=>{
        var fragment = jquery.parseHTML(resp.text());
        wgxpath.install(window);
        var resultMap = {};
        for (var xpath of xpaths) {
          var result = window.document.evaluate(xpath, fragment[0], null, wgxpath.XPathResultType.STRING_TYPE, null);
          resultMap[xpath] = result.stringValue;
        }
        return resultMap;
    });
  }

  public generateXPath(url: string, textToSearch: string): Observable<string> {
    return this.http.get(url).map((resp)=>{
        var fragment = jquery.parseHTML(resp.text());
        wgxpath.install(window);
        var result = window.document.evaluate("//*[contains(text()," + textToSearch + ")]", fragment[0], null, wgxpath.XPathResultType.FIRST_ORDERED_NODE_TYPE, null);
        var node = result.singleNodeValue;
        //TODO generate path for node based on
        return null;
    });
  }

}
