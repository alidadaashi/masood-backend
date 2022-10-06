export const utFlatMapArray = <T> (arr: T[][]):T[] => arr.reduce((acc, val) => acc.concat(val), []);

export const other = "";
