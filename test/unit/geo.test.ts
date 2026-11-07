import { describe, it, expect } from 'vitest'
import { latLngToVector3 } from '@/lib/geo'

describe('latLngToVector3', () => {
  it('places points at the given radius from the origin', () => {
    const v = latLngToVector3(40, -74, 1)
    expect(Math.hypot(v.x, v.y, v.z)).toBeCloseTo(1, 5)
  })

  it('maps the poles to ±y', () => {
    expect(latLngToVector3(90, 0, 1).y).toBeCloseTo(1, 5)
    expect(latLngToVector3(-90, 123, 1).y).toBeCloseTo(-1, 5)
  })

  it('scales with radius', () => {
    const v = latLngToVector3(12, 45, 3)
    expect(Math.hypot(v.x, v.y, v.z)).toBeCloseTo(3, 5)
  })

  it('produces distinct points for distinct coordinates', () => {
    expect(latLngToVector3(51, 0)).not.toEqual(latLngToVector3(35, 139))
  })
})
