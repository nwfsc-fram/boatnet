export function getSelected(program: string, tableType: string) {
    const localStorageKey: string = program + '-' + tableType;
    let vals: any = localStorage.getItem(localStorageKey);
    vals = JSON.parse(vals);
    const sel: any = 'selection';
    vals = vals[sel];
    const ids: any[] = [];
    for (const val of vals) {
        ids.push(val._id);
    }
    console.log(ids);
    return ids;
}
