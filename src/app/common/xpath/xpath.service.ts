import {Injectable} from '@angular/core';
import {Jsonp} from '@angular/http';
import {Observable} from 'rxjs/Rx';


var wgxpath = require('wgxpath');


var jquery = require('jquery');
var jqueryXDomainAjax = require('./jquery.xdomainajax.js');

@Injectable()
export class XpathService {
    public name: string = 'XpathService';

    constructor(private jsonp: Jsonp) {
    }



    public resolveXPaths(url: string, ...xpaths: string[]): Observable<{ [key: string]: string }> {

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
        }))
        .map((data) => {
            var fragment = jquery.parseHTML(data);
            wgxpath.install(window);
            var resultMap: { [key: string]: string } = {};
            for (var xpath of xpaths) {
              if (xpath) {
                var result = window.document.evaluate(xpath, fragment[0], null, wgxpath.XPathResultType.STRING_TYPE, null);
                resultMap[xpath] = result.stringValue;
              }
            }
            return resultMap;
        });
    }

    public generateXPath(url: string, textToSearch: string): Observable<string> {
        return this.jsonp.request(url, { method: 'Get' }).map((resp) => {
            var fragment = jquery.parseHTML(resp.text());
            wgxpath.install(window);
            var result = window.document.evaluate("//*[contains(text()," + textToSearch + ")]", fragment[0], null, wgxpath.XPathResultType.FIRST_ORDERED_NODE_TYPE, null);
            var node = result.singleNodeValue;
            //TODO generate path for node based on
            return null;
        });
    }

}
