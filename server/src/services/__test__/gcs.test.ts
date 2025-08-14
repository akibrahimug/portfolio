import { createV4UploadSignedUrl } from '../gcs';

jest.mock('@google-cloud/storage', () => ({
  Storage: class {
    bucket() {
      return {
        file() {
          return {
            async getSignedUrl() {
              return ['https://signed.example'];
            },
          };
        },
      };
    }
  },
}));

describe('gcs signed urls', () => {
  it('returns the signed url string', async () => {
    const url = await createV4UploadSignedUrl({
      bucket: 'b',
      objectPath: 'o',
      contentType: 'text/plain',
      expiresInSeconds: 15 * 60,
    });
    expect(typeof url).toBe('string');
    expect(url).toBe('https://signed.example');
  });
});
