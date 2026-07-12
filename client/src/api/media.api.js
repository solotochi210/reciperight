import api from './axios';

/**
 * Upload an image file to the backend media endpoint.
 * @param {File} file
 * @param {'cover'|'step'|'avatar'} kind
 */
export const mediaApi = {
  upload: (file, kind = 'cover') => {
    const form = new FormData();
    form.append('image', file);
    form.append('kind', kind);
    return api
      .post('/media/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data);
  },
  remove: (publicId) => api.delete(`/media/${publicId}`).then((r) => r.data),
};

export default mediaApi;
