import { CountsWeightsData } from './counts-weights-data';

export class TallyDataEntry {
  catch: number;
  speciesCode: string;
  weightMethod: number;
  weight: number;
  fishCount: number;
  basketFishCount: number;
  averageWeight?: number;
  disposition: string;
  countsWeights?: CountsWeightsData;
  calculations?: string;

  rollupCountsWeights(): void {
    if (this.countsWeights.cwData && this.countsWeights.cwData.length > 0) {
      this.basketFishCount = this.countsWeights.basketTotalFishCount;
      // TODO to be safe, maybe recalc average weight here?
      this.averageWeight = this.countsWeights.averageFishWeight;

      this.weight = this.fishCount * this.averageWeight;
      const calcStrings = [];
      for (const cw of this.countsWeights.cwData) {
        calcStrings.push(`${cw.count}@${cw.weight.toFixed(2)}`);
      }
      this.calculations = calcStrings.join(', ');
      this.calculations += ` \n(Avg. Wt. = ${this.averageWeight.toFixed(4)})`;
    } else {
      this.basketFishCount = undefined;
      this.averageWeight = undefined;
      this.weight = undefined;
      this.calculations = undefined;
    }
  }
}
