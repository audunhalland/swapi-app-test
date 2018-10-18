import * as ra from 'react-admin';

// Using node proxy
const baseUrl = '';

const convertResponse = (response) => {
  const contentRange = response.headers.get('content-range');
  const splitRange = contentRange && contentRange.match(/([0-9]+)-([0-9]+)\/([0-9]+)/);
  return response.json()
    .then(json => ({
      data: json,
      ...splitRange && { total: parseInt(splitRange[3], 10) }
    }));
}

const fetchApi = (resource, query, options) => {
  let url = baseUrl + '/' + resource;
  if (Object.keys(query).length > 0) {
    url += '?' + Object.keys(query)
      .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(query[k]))
      .join('&');
  }
  return fetch(url, options);
};

const createHeaders = (params) => {
  const headers = {};
  if (params.pagination) {
    const { page, perPage } = params.pagination;
    const start = (page - 1) * perPage;
    const end = start + perPage;

    headers['Range-Unit'] = 'items';
    //headers['Content-Range'] = `${start}-${end}/*`;
    headers['Range'] = `${start}-${end}`;
    headers['Prefer'] = 'count=exact';
  }

  return headers;
}

export default (type, resource, params) => {
  console.log('request: ', type, resource, params);
  switch (type) {
    case ra.GET_LIST: {
      return fetchApi(resource, {}, {
        headers: createHeaders(params)
      })
        .then(convertResponse);
    }
    default:
      return Promise.reject();
  }
};
