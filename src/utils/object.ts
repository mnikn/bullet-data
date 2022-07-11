export function iterObject(o: any, fn: (k: string, v: any) => void) {
  Object.keys(o).forEach(function (k) {
    if (o[k] === null || o[k] === undefined) {
      return;
    }
    fn(k, o[k]);
    if (typeof o[k] === 'object') {
      iterObject(o[k], fn);
      return;
    }
  });
}
