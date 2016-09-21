import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Rx';

import {XpathTokens} from './xpath-tokens.enum';


const wgxpath = require('wgxpath');

//TODO actually it should not be necessary as it is provided using WebPack ProvidePlugin
const jquery = require('jquery');
const jqueryXDomainAjax = require('./jquery.xdomainajax.js');


@Injectable()
export class XpathService {
    public name: string = 'XpathService';

    constructor() {
    }

    public getXDomainContent(url: string): Observable<any> {
        return Observable.create((observer) => jquery.ajax({
            url: url,
            dataType: "text",
            type: "get",
            success: function(response) {
                var doc = response.responseText;
                doc = doc.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/gi,
                    function(match, capture) {
                        return "<img no_load_src=\"" + capture + "\" />";
                    }
                );
                observer.next(doc);
                observer.complete();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                observer.error(errorThrown);
            }
        }));
    }


    public loadAndResolveXPaths(url: string, ...xpaths: string[]): Observable<XpathResolutionResult> {
        return this.getXDomainContent(url)
            .map((data) => {
                return {
                    url: url,
                    xpathResult: this.resolveXPaths(data, ...xpaths)
                };
            });
    }

    public resolveXPaths(data: string, ...xpaths: string[]): { [key: string]: string } {
        let fragment = jquery.parseHTML(data);
        wgxpath.install(window);
        let xpathResultMap: { [key: string]: string } = {};
        for (var xpath of xpaths) {
            if (xpath) {
                let resolvedXPath = this.processXPathTokens(xpath);
                let result = window.document.evaluate(resolvedXPath, fragment[0], null, wgxpath.XPathResultType.STRING_TYPE, null);
                xpathResultMap[xpath] = result.stringValue;
            }
        }
        return xpathResultMap;
    }

    private processXPathTokens(xpath: string): string {
        for (let token of XpathTokens.values()) {
            xpath = xpath.replace(new RegExp('\\$' + token, 'g'), XpathTokens.resolve(token));
        }
        return xpath;
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

export interface XpathResolutionResult {
    url: string;
    xpathResult: { [key: string]: string };
}
