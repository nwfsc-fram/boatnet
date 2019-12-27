import { WcgopOperation } from '@boatnet/bn-models';

export class WcgopOperationInit implements WcgopOperation {
    public type: string = 'wcgop-haul';
    public operationNum: number;

    constructor(operationNum: number) {
        this.operationNum = operationNum;
    }
}
