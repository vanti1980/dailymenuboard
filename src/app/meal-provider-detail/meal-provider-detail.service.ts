import {Injectable} from '@angular/core';
var wgxpath = require('wgxpath');
declare var jQuery:JQueryStatic;

@Injectable()
export class MealProviderDetailService {
  public resolveXPath(url: string, xpath: string) {
    var expressionString = '//*[@id="content"]';
    console.log("jQuery:" + JSON.stringify(jQuery));
    var fragment = jQuery.parseHTML("<html><body><div id='header'>header</div><div id='content'>content</div></body></html>");
    wgxpath.install(document);
    var result = window.document.evaluate(expressionString, fragment[0], null, wgxpath.XPathResultType.STRING_TYPE, null);
    console.log('The Word of the Day is "' + result.stringValue + '."');
  }
}
