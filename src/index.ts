console.log(undefined == null)

function getRandomIndexExcluding(fullIndex: number, excludingIndex: number): number {
  const range: number[] = Array.from({ length: fullIndex }, (_, i) => i);
  const excludingIndexPosition = range.indexOf(excludingIndex);

  if (excludingIndexPosition > -1) {
    range.splice(excludingIndexPosition, 1);
  }
  const randomIndex = Math.floor(Math.random() * range.length);
  return range[randomIndex];
}