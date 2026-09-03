/**
 * Distributes `count` points evenly on a sphere surface using the
 * Fibonacci sphere algorithm (golden-angle spiral).
 *
 * The golden angle (π × (3 − √5)) ensures near-uniform distribution
 * even for small counts. Each point is placed at:
 *   y = 1 − (2i / (count − 1))           ← ranges from +1 to −1
 *   radius_at_y = √(1 − y²)              ← horizontal ring radius
 *   θ = i × golden_angle                  ← azimuthal angle
 *
 * Points sit at `radius` distance from origin.
 */
export function fibonacciSphere(
  count: number,
  radius: number
): [number, number, number][] {
  const points: [number, number, number][] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~2.39996 rad

  for (let i = 0; i < count; i++) {
    // y goes from +1 (top) to −1 (bottom)
    const y = 1 - (i / (count - 1 || 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = i * goldenAngle;

    const x = Math.cos(theta) * radiusAtY * radius;
    const z = Math.sin(theta) * radiusAtY * radius;

    points.push([x, y * radius, z]);
  }

  return points;
}
