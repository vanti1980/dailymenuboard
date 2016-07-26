
export enum LoadStatus {
  NOT_LOADED,
  LOADED,
  EMPTY,
  ERROR
}

export class LoadInfo {
  constructor(
    private _status: LoadStatus,
    private _errorMsg?: string) {
  }

  public get status():LoadStatus {
    return this._status;
  }

  public get errorMsg():string {
    return this._errorMsg;
  }

}
