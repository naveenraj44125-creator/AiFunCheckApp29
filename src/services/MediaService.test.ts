/**
 * Tests for Media Service
 * Requirements: 7.3 - Media files stored with unique identifiers
 */

import {
  uploadMedia,
  getMedia,
  getMediaEntry,
  deleteMedia,
  mediaExists,
  clearMediaStorage,
  getMediaCount,
  isSupportedMimeType,
  isImageMimeType,
  isVideoMimeType,
  SUPPORTED_IMAGE_MIME_TYPES,
  SUPPORTED_VIDEO_MIME_TYPES,
  SUPPORTED_MIME_TYPES,
} from './MediaService';

describe('MediaService', () => {
  // Clear storage before each test
  beforeEach(() => {
    clearMediaStorage();
  });

  describe('MIME type validation', () => {
    describe('isSupportedMimeType', () => {
      it('should return true for supported image MIME types', () => {
        expect(isSupportedMimeType('image/jpeg')).toBe(true);
        expect(isSupportedMimeType('image/png')).toBe(true);
        expect(isSupportedMimeType('image/gif')).toBe(true);
      });

      it('should return true for supported video MIME types', () => {
        expect(isSupportedMimeType('video/mp4')).toBe(true);
        expect(isSupportedMimeType('video/webm')).toBe(true);
      });

      it('should return false for unsupported MIME types', () => {
        expect(isSupportedMimeType('image/bmp')).toBe(false);
        expect(isSupportedMimeType('video/avi')).toBe(false);
        expect(isSupportedMimeType('application/pdf')).toBe(false);
        expect(isSupportedMimeType('text/plain')).toBe(false);
        expect(isSupportedMimeType('')).toBe(false);
      });
    });

    describe('isImageMimeType', () => {
      it('should return true for image MIME types', () => {
        expect(isImageMimeType('image/jpeg')).toBe(true);
        expect(isImageMimeType('image/png')).toBe(true);
        expect(isImageMimeType('image/gif')).toBe(true);
      });

      it('should return false for non-image MIME types', () => {
        expect(isImageMimeType('video/mp4')).toBe(false);
        expect(isImageMimeType('video/webm')).toBe(false);
        expect(isImageMimeType('application/pdf')).toBe(false);
      });
    });

    describe('isVideoMimeType', () => {
      it('should return true for video MIME types', () => {
        expect(isVideoMimeType('video/mp4')).toBe(true);
        expect(isVideoMimeType('video/webm')).toBe(true);
      });

      it('should return false for non-video MIME types', () => {
        expect(isVideoMimeType('image/jpeg')).toBe(false);
        expect(isVideoMimeType('image/png')).toBe(false);
        expect(isVideoMimeType('application/pdf')).toBe(false);
      });
    });
  });

  describe('uploadMedia', () => {
    it('should upload JPEG image and return unique ID', async () => {
      const data = Buffer.from('fake jpeg data');
      const mediaId = await uploadMedia(data, 'image/jpeg');

      expect(mediaId).toBeDefined();
      expect(typeof mediaId).toBe('string');
      expect(mediaId.length).toBeGreaterThan(0);
    });

    it('should upload PNG image and return unique ID', async () => {
      const data = Buffer.from('fake png data');
      const mediaId = await uploadMedia(data, 'image/png');

      expect(mediaId).toBeDefined();
      expect(typeof mediaId).toBe('string');
    });

    it('should upload GIF image and return unique ID', async () => {
      const data = Buffer.from('fake gif data');
      const mediaId = await uploadMedia(data, 'image/gif');

      expect(mediaId).toBeDefined();
      expect(typeof mediaId).toBe('string');
    });

    it('should upload MP4 video and return unique ID', async () => {
      const data = Buffer.from('fake mp4 data');
      const mediaId = await uploadMedia(data, 'video/mp4');

      expect(mediaId).toBeDefined();
      expect(typeof mediaId).toBe('string');
    });

    it('should upload WebM video and return unique ID', async () => {
      const data = Buffer.from('fake webm data');
      const mediaId = await uploadMedia(data, 'video/webm');

      expect(mediaId).toBeDefined();
      expect(typeof mediaId).toBe('string');
    });

    it('should generate unique IDs for different uploads', async () => {
      const data1 = Buffer.from('data 1');
      const data2 = Buffer.from('data 2');

      const mediaId1 = await uploadMedia(data1, 'image/jpeg');
      const mediaId2 = await uploadMedia(data2, 'image/jpeg');

      expect(mediaId1).not.toBe(mediaId2);
    });

    it('should reject unsupported MIME types', async () => {
      const data = Buffer.from('some data');

      await expect(uploadMedia(data, 'image/bmp')).rejects.toThrow('Unsupported MIME type');
      await expect(uploadMedia(data, 'video/avi')).rejects.toThrow('Unsupported MIME type');
      await expect(uploadMedia(data, 'application/pdf')).rejects.toThrow('Unsupported MIME type');
      await expect(uploadMedia(data, 'text/plain')).rejects.toThrow('Unsupported MIME type');
    });

    it('should reject empty data', async () => {
      const emptyBuffer = Buffer.from('');

      await expect(uploadMedia(emptyBuffer, 'image/jpeg')).rejects.toThrow('Media data cannot be empty');
    });

    it('should increment media count after upload', async () => {
      expect(getMediaCount()).toBe(0);

      await uploadMedia(Buffer.from('data 1'), 'image/jpeg');
      expect(getMediaCount()).toBe(1);

      await uploadMedia(Buffer.from('data 2'), 'image/png');
      expect(getMediaCount()).toBe(2);
    });
  });

  describe('getMedia', () => {
    it('should retrieve uploaded media by ID', async () => {
      const originalData = Buffer.from('test image data');
      const mediaId = await uploadMedia(originalData, 'image/jpeg');

      const retrievedData = await getMedia(mediaId);

      expect(retrievedData).not.toBeNull();
      expect(retrievedData!.equals(originalData)).toBe(true);
    });

    it('should return null for non-existent media ID', async () => {
      const result = await getMedia('non-existent-id');

      expect(result).toBeNull();
    });

    it('should return a copy of the data (not the original reference)', async () => {
      const originalData = Buffer.from('test data');
      const mediaId = await uploadMedia(originalData, 'image/jpeg');

      const retrievedData1 = await getMedia(mediaId);
      const retrievedData2 = await getMedia(mediaId);

      // Should be equal in content
      expect(retrievedData1!.equals(retrievedData2!)).toBe(true);
      
      // Modifying one should not affect the other
      retrievedData1![0] = 0xFF;
      const retrievedData3 = await getMedia(mediaId);
      expect(retrievedData3!.equals(originalData)).toBe(true);
    });
  });

  describe('getMediaEntry', () => {
    it('should retrieve media entry with metadata', async () => {
      const originalData = Buffer.from('test image data');
      const mimeType = 'image/jpeg';
      const mediaId = await uploadMedia(originalData, mimeType);

      const entry = await getMediaEntry(mediaId);

      expect(entry).not.toBeNull();
      expect(entry!.id).toBe(mediaId);
      expect(entry!.data.equals(originalData)).toBe(true);
      expect(entry!.mimeType).toBe(mimeType);
      expect(entry!.size).toBe(originalData.length);
      expect(entry!.createdAt).toBeInstanceOf(Date);
    });

    it('should return null for non-existent media ID', async () => {
      const result = await getMediaEntry('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('deleteMedia', () => {
    it('should delete existing media and return true', async () => {
      const data = Buffer.from('test data');
      const mediaId = await uploadMedia(data, 'image/jpeg');

      const deleted = await deleteMedia(mediaId);

      expect(deleted).toBe(true);
      expect(await getMedia(mediaId)).toBeNull();
    });

    it('should return false for non-existent media ID', async () => {
      const deleted = await deleteMedia('non-existent-id');

      expect(deleted).toBe(false);
    });

    it('should decrement media count after deletion', async () => {
      const mediaId = await uploadMedia(Buffer.from('data'), 'image/jpeg');
      expect(getMediaCount()).toBe(1);

      await deleteMedia(mediaId);
      expect(getMediaCount()).toBe(0);
    });
  });

  describe('mediaExists', () => {
    it('should return true for existing media', async () => {
      const data = Buffer.from('test data');
      const mediaId = await uploadMedia(data, 'image/jpeg');

      const exists = await mediaExists(mediaId);

      expect(exists).toBe(true);
    });

    it('should return false for non-existent media', async () => {
      const exists = await mediaExists('non-existent-id');

      expect(exists).toBe(false);
    });

    it('should return false after media is deleted', async () => {
      const data = Buffer.from('test data');
      const mediaId = await uploadMedia(data, 'image/jpeg');

      await deleteMedia(mediaId);
      const exists = await mediaExists(mediaId);

      expect(exists).toBe(false);
    });
  });

  describe('clearMediaStorage', () => {
    it('should remove all media from storage', async () => {
      await uploadMedia(Buffer.from('data 1'), 'image/jpeg');
      await uploadMedia(Buffer.from('data 2'), 'image/png');
      await uploadMedia(Buffer.from('data 3'), 'video/mp4');

      expect(getMediaCount()).toBe(3);

      clearMediaStorage();

      expect(getMediaCount()).toBe(0);
    });
  });

  describe('supported MIME types constants', () => {
    it('should have correct image MIME types', () => {
      expect(SUPPORTED_IMAGE_MIME_TYPES).toContain('image/jpeg');
      expect(SUPPORTED_IMAGE_MIME_TYPES).toContain('image/png');
      expect(SUPPORTED_IMAGE_MIME_TYPES).toContain('image/gif');
      expect(SUPPORTED_IMAGE_MIME_TYPES).toHaveLength(3);
    });

    it('should have correct video MIME types', () => {
      expect(SUPPORTED_VIDEO_MIME_TYPES).toContain('video/mp4');
      expect(SUPPORTED_VIDEO_MIME_TYPES).toContain('video/webm');
      expect(SUPPORTED_VIDEO_MIME_TYPES).toHaveLength(2);
    });

    it('should have all MIME types combined', () => {
      expect(SUPPORTED_MIME_TYPES).toHaveLength(5);
      expect(SUPPORTED_MIME_TYPES).toContain('image/jpeg');
      expect(SUPPORTED_MIME_TYPES).toContain('image/png');
      expect(SUPPORTED_MIME_TYPES).toContain('image/gif');
      expect(SUPPORTED_MIME_TYPES).toContain('video/mp4');
      expect(SUPPORTED_MIME_TYPES).toContain('video/webm');
    });
  });

  describe('media persistence (Requirement 7.3)', () => {
    it('should persist media and allow retrieval', async () => {
      // Upload various media types
      const jpegData = Buffer.from('jpeg content');
      const pngData = Buffer.from('png content');
      const mp4Data = Buffer.from('mp4 content');

      const jpegId = await uploadMedia(jpegData, 'image/jpeg');
      const pngId = await uploadMedia(pngData, 'image/png');
      const mp4Id = await uploadMedia(mp4Data, 'video/mp4');

      // Verify all can be retrieved
      expect((await getMedia(jpegId))!.equals(jpegData)).toBe(true);
      expect((await getMedia(pngId))!.equals(pngData)).toBe(true);
      expect((await getMedia(mp4Id))!.equals(mp4Data)).toBe(true);
    });

    it('should store media with unique identifiers', async () => {
      const ids = new Set<string>();
      
      // Upload multiple files
      for (let i = 0; i < 10; i++) {
        const data = Buffer.from(`data ${i}`);
        const id = await uploadMedia(data, 'image/jpeg');
        ids.add(id);
      }

      // All IDs should be unique
      expect(ids.size).toBe(10);
    });
  });
});
