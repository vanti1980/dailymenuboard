import {Injectable} from '@angular/core';
var wgxpath = require('wgxpath');


var jquery = require('jquery');

@Injectable()
export class MealProviderDetailService {
   public name: string = 'Injected Service';

   constructor() {
     console.log('MealProviderDetailService constructor');
   }

  resolveXPath(url: string, xpath: string) {
    var expressionString = '//*[@id="content"]';
    console.log("jquery:" + jquery);
    var fragment = jquery.parseHTML("<html><body><div id='header'>header</div><div id='content'>content</div></body></html>");
    console.log("wgxpath:" + wgxpath);
     console.log("fragment:" + fragment);

    wgxpath.install(window);
    var result = window.document.evaluate(expressionString, fragment[0], null, wgxpath.XPathResultType.STRING_TYPE, null);
    console.log('The Word of the Day is "' + result.stringValue + '."');
  }
}
