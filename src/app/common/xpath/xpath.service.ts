import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Observable} from 'rxjs/Rx';


var wgxpath = require('wgxpath');


var jquery = require('jquery');

@Injectable()
export class XpathService {
   public name: string = 'XpathService';

   constructor(private http:Http) {
   }



  public resolveXPaths(url: string, ...xpaths: string[]):Observable<{[key:string]:string}> {



     // Using YQL and JSONP
     jquery.ajax({
         url: "http://www.bonnierestro.hu/hu/napimenu/",

         // The name of the callback parameter, as specified by the YQL service
         jsonp: "callback",

         // Tell jQuery we're expecting JSONP
         dataType: "jsonp",

         // Tell YQL what we want and that we want JSON
         /*
         data: {
             q: "select title,abstract,url from search.news where query=\"cat\"",
             format: "json"
         },
         */

         // Work with the response
         success: function( response ) {
             console.log( response ); // server response
         }
     });



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
