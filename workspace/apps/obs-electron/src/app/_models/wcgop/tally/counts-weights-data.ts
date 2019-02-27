export class CountsWeightsData {
  constructor(
    public averageFishWeight?: number,
    public basketTotalFishWeight?: number,
    public basketTotalFishCount?: number,
    public cwData?: Array<{ count: number; weight: number; avg: number }>
  ) {}

  static addCountWeight(
    data: CountsWeightsData,
    count: number,
    weight: number
  ) {
    const avg = count > 0 ? weight / count : undefined;
    const entry = { count: count, weight: weight, avg: avg };
    data.cwData.unshift(entry); // or unshift for newest at top?
    CountsWeightsData.calcCountAvgWeight(data);
  }

  static calcCountAvgWeight(data: CountsWeightsData): void {
    let totalWeight = 0;
    let totalCount = 0;
    for (const cw of data.cwData) {
      if (cw.count) {
        cw.avg = cw.weight / cw.count;
      }
      totalCount += cw.count;
      totalWeight += cw.weight;
    }
    data.averageFishWeight = totalWeight / totalCount;
    data.basketTotalFishCount = totalCount;
    data.basketTotalFishWeight = totalWeight;
  }
}
