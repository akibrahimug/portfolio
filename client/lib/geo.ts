/** Pure geo helper — kept dependency-free so it can be unit-tested without three.js. */

export interface Vec3 {
  x: number
  y: number
  z: number
}

/** Convert latitude/longitude to a point on a sphere of the given radius (+y = north). */
export function latLngToVector3(lat: number, lng: number, radius = 1): Vec3 {
  const phi = ((90 - lat) * Math.PI) / 180
  const theta = ((lng + 180) * Math.PI) / 180
  return {
    x: -radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta),
  }
}
