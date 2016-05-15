import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Observable} from 'rxjs/Rx';


var wgxpath = require('wgxpath');


var jquery = require('jquery');
var jqueryXDomainAjax = require('./jquery.xdomainajax.js');

@Injectable()
export class XpathService {
    public name: string = 'XpathService';

    constructor(private http: Http) {
    }

    private getXDomainContent(url: string):Observable<any> {
      return Observable.create((observer) => jquery.ajax({
          url: url,
          dataType: "text",
          type: "get",
          success: function(response) {
            var doc = response.responseText;
            doc = doc.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/gi,
              function (match, capture) {
                return "<img no_load_src=\"" +capture+ "\" />";
              }
            );
            observer.next(doc);
          }
      }));
    }


    public resolveXPaths(url: string, ...xpaths: string[]): Observable<XpathResolutionResult> {
      return this.getXDomainContent(url)
        .map((data) => {
            var fragment = jquery.parseHTML(data);
            wgxpath.install(window);
            var xpathResultMap: {[key: string]: string} = {};
            for (var xpath of xpaths) {
              if (xpath) {
                var result = window.document.evaluate(xpath, fragment[0], null, wgxpath.XPathResultType.STRING_TYPE, null);
                xpathResultMap[xpath] = result.stringValue;
              }
            }
            return {
              url: url,
              xpathResult:xpathResultMap
            };
        });
    }

    public generateXPath(url: string, textToSearch: string): Observable<string> {
      return this.getXDomainContent(url)
        .map((data) => {
            var fragment = jquery.parseHTML(data);
            wgxpath.install(window);
            var result = window.document.evaluate("//*[contains(text()," + textToSearch + ")]", fragment[0], null, wgxpath.XPathResultType.FIRST_ORDERED_NODE_TYPE, null);
            var node = result.singleNodeValue;
            //TODO generate path for node based on
            return null;
        });
    }

}

export interface XpathResolutionResult
{
  url: string;
  xpathResult: { [key: string]: string};
}
