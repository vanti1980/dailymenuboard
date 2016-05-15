export class Price {
  constructor(public value: number,
      public currency: string) {
  }

  public static fromString(value:string):Price {
    if (!value) {
      return null;
    }
    let tokens = value.trim().split(" ");
    if (tokens.length == 1) {
      return new Price(Number(prepareAmount(tokens[0])),"");
    }
    let amount = Number(prepareAmount(tokens[0]));
    if (Number.isNaN(amount)) {
        return new Price(Number(prepareAmount(tokens[1])), tokens[0]);
    }
    else {
      return new Price(amount, tokens[1]);
    }
  }

}

function prepareAmount(amount: string):string {
  return amount.replace(/\,\./g,'');
}
