function findClosest(x: number, y: number, z: number): number {
  const distance1 = Math.abs(x - z);
  const distance2 = Math.abs(y - z);

  if (distance1 < distance2) {
    return 1;
  } else if (distance1 > distance2) {
    return 2;
  }

  return 0;
}
