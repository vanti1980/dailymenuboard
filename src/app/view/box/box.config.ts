import { NgGrid, NgGridItem, NgGridConfig } from 'angular2-grid';

export class BoxConfig implements NgGridConfig{
   public col: number;
   public row: number;
   constructor(col : number, row: number){
      this.col = col;
      this.row = row;
   }
}
