export function iterObject(
  o: any,
  fn: (k: string, v: any, fullPath: string) => void,
  originPath = ''
) {
  Object.keys(o).forEach(function (k) {
    if (o[k] === null || o[k] === undefined) {
      return;
    }
    fn(k, o[k], originPath ? `${originPath}.${k}` : k);
    if (typeof o[k] === 'object') {
      iterObject(o[k], fn, originPath ? `${originPath}.${k}` : k);
      return;
    }
  });
}
