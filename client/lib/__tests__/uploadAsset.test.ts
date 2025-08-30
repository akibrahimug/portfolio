import { httpClient } from '../http-client'

// Node test env: no window → uploadAsset will use fetch for PUT
global.fetch = jest.fn() as any
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('uploadAsset (technology)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:5000' // base is normalized by client
    ;(global as any).File = class {
      name: string
      size: number
      type: string
      constructor(parts: any[], filename: string, opts: any) {
        this.name = filename
        this.size = (parts?.[0]?.length || 0) as number
        this.type = opts?.type || 'application/octet-stream'
      }
    }
  })

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL
  })

  it('sends projectId=technology and returns technologies path', async () => {
    // 1) /assets/request-upload
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        uploadUrl: 'https://signed.example/upload',
        objectPath: 'technologies/tech-icons/123-icon.png',
        headers: { 'Content-Type': 'image/png' },
      }),
    } as any)

    // 2) PUT to signed URL
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}) } as any)

    // 3) /assets/confirm
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        asset: { id: '1' },
        publicUrl: 'https://storage.googleapis.com/bucket/technologies/tech-icons/123-icon.png',
        viewUrl: 'https://storage.googleapis.com/bucket/technologies/tech-icons/123-icon.png',
      }),
    } as any)

    const file = new (global as any).File([new Uint8Array([1, 2, 3])], 'icon.png', {
      type: 'image/png',
    })

    const res = await httpClient.uploadAsset(
      file as any,
      { assetType: 'technology' },
      'token-123',
    )

    expect(res.success).toBe(true)

    // Validate first call payload had projectId=technology
    const firstCall = mockFetch.mock.calls.find((c) =>
      String(c[0]).includes('/assets/request-upload'),
    )!
    const body = JSON.parse((firstCall?.[1] as any)?.body)
    expect(body.projectId).toBe('technology')

    // Validate resulting URL path
    expect(res.data?.publicUrl).toContain('/technologies/tech-icons/')
  })
})


