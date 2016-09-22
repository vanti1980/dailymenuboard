
import moment = require('moment');
import 'moment/locale/de';
import 'moment/locale/en-gb';
import 'moment/locale/hu';

export class XpathTokens {
    static dayAbbrOfWeek = function(): string {
      return getNow().format('ddd');
    };

    static dayAbbrOfWeekCap = function(): string {
      return getNow().format('ddd').toLocaleUpperCase();
    };

    static dayAbbrOfWeekCapFirst = function(): string {
      let str = getNow().format('ddd');
      return str[0].toLocaleUpperCase() + str.substring(1);
    };

    static dayOfWeek = function(): string {
      return getNow().format('dddd');
    };

    static dayOfWeekCap = function(): string {
      return getNow().format('dddd').toLocaleUpperCase();
    };

    static dayOfWeekCapFirst = function(): string {
      let str = getNow().format('dddd');
      return str[0].toLocaleUpperCase() + str.substring(1);
    };

    static numberOfWeekDay = function(): string {
      return getNow().format('E');
    };

    static dayOfMonth = function(): string {
      return getNow().format('D');
    };

    static nameOfMonth = function(): string {
      return getNow().format('MMMM');
    };

    static nameOfMonthCap = function(): string {
      return getNow().format('MMMM').toLocaleUpperCase();
    };

    static nameOfMonthCapFirst = function(): string {
      let str = getNow().format('MMMM');
      return str[0].toLocaleUpperCase() + str.substring(1);
    };

    static abbrOfMonth = function(): string {
      return getNow().format('MMM');
    };

    static abbrOfMonthCap = function(): string {
      return getNow().format('MMM').toLocaleUpperCase();
    };

    static abbrOfMonthCapFirst = function(): string {
      let str = getNow().format('MMM');
      return str[0].toLocaleUpperCase() + str.substring(1);
    };

    static numberOfMonth = function(): string {
      return getNow().format('M');
    };

    static firstDayOfWeek = function(): string {
      return getNow().day(1).format('D');
    };


    public static values(): string[] {
      return [
        'dayAbbrOfWeekCapFirst',
        'dayAbbrOfWeekCap',
        'dayAbbrOfWeek',
        'dayOfWeekCapFirst',
        'dayOfWeekCap',
        'dayOfWeek',
        'numberOfWeekDay',
        'dayOfMonth',
        'nameOfMonthCapFirst',
        'nameOfMonthCap',
        'nameOfMonth',
        'abbrOfMonthCapFirst',
        'abbrOfMonthCap',
        'abbrOfMonth',
        'numberOfMonth',
        'firstDayOfWeek'
      ];
    }

    public static resolve(val: string): string {
      return XpathTokens[val]();
    }

}

function getNow(): moment.Moment {
  const locale = navigator.language;
  moment.locale(locale);

  //  let now = moment().subtract(2, 'days');
  let now = moment();
  return now;
}
