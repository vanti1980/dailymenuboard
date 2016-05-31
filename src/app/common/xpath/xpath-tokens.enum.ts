///<reference path="../../../../typings/modules/moment/index.d.ts" />

import moment = require("moment");

export class XpathTokens {
    static dayAbbrOfWeek = function():string {
      return getNow().format("ddd");
    };

    static dayOfWeek = function():string {
      return getNow().format("dddd");
    };

    static dayOfMonth = function():string {
      return getNow().format("D");
    };

    static nameOfMonth = function():string {
      return getNow().format("MMMM");
    };

    static abbrOfMonth = function():string {
      return getNow().format("MMM");
    };

    static numberOfMonth = function():string {
      return getNow().format("M");
    };

    static firstDayOfWeek = function():string {
      return getNow().day(-1).format("D");
    };


    public static values():string[] {
      return ['dayAbbrOfWeek', 'dayOfWeek', 'dayOfMonth', 'nameOfMonth', 'abbrOfMonth', 'numberOfMonth', 'firstDayOfWeek'];
    }

    public static resolve(val:string):string {
      console.log("****" + XpathTokens[val]);
      return XpathTokens[val]();
    }

}

function getNow():moment.Moment {
  let now = moment();
  moment.locale(navigator.language);
  return now;
}
