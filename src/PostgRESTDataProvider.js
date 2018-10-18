import * as ra from 'react-admin';

// Using node proxy
const baseUrl = '';

const apiToReactAdmin = (obj, resource, foreignMap) => {
  const foreignSelects = foreignMap[resource];
  const overridden = Object.keys(foreignSelects).reduce((agg, key) => {
    agg[key] = obj[key].map(foreignObj => (
      foreignObj[foreignSelects[key][1]]
    ));
    return agg;
  }, {});
  return {
    ...obj,
    ...overridden,
  };
};

// Filter out foreign/join table values
const reactAdminToRawApi = (obj, resource, foreignMap) => {
  const foreignSelects = foreignMap[resource];
  const newObj = {...obj};
  Object.keys(foreignSelects).forEach(key => {
    delete newObj[key];
  });
  return newObj;
};

const convertResponse = (response, type, resource, foreignMap) => {
  const contentRange = response.headers.get('content-range');
  const splitRange = contentRange && contentRange.match(/([0-9]+)-([0-9]+)\/([0-9]+)/);
  return response.json()
    .then(json => {
      console.log('response json: ', json);
      return json;
    })
    .then(json => ({
      data: json.map(obj => apiToReactAdmin(obj, resource, foreignMap)),
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
  console.log('fetch ', url, options);
  return fetch(url, options);
};

const createHeaders = (params) => {
  const headers = {};
  if (params.pagination) {
    const { page, perPage } = params.pagination;
    const start = (page - 1) * perPage;
    const end = start + perPage;

    headers['Range-Unit'] = 'items';
    headers['Range'] = `${start}-${end}`;
    headers['Prefer'] = 'count=exact';
  }

  return headers;
}

const createSelectQuery = (foreignMap, type, resource, params) => {
  const foreignSelects = foreignMap[resource];
  const query = {};
  if (foreignSelects && Object.keys(foreignSelects).length) {
    query['select'] = '*,' +
      Object.keys(foreignSelects)
        .map(key => (
          `${key}:${foreignSelects[key][0]}(${foreignSelects[key][1]})`
        ))
        .join(',');
  }
  if (type === ra.GET_MANY && params.ids) {
    const list = params.ids.map((id) => `"${id}"`).join(',');
    query['id'] = `in.(${list})`;
  }
  return query;
};

const foreignMapProvider = foreignMap => (type, resource, params) => {
  console.log('request: ', type, resource, params);
  switch (type) {
    case ra.GET_LIST:
    case ra.GET_MANY: {
      return fetchApi(resource,
        createSelectQuery(foreignMap, type, resource, params),
        {
          headers: createHeaders(params),
        }
      )
        .then(response => convertResponse(response, type, resource, foreignMap));
    }
    case ra.CREATE: {
      return fetchApi(resource, {},
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(reactAdminToRawApi(params.data, resource, foreignMap)),
        })
        .then(response => response.json())
        .then(json => ({
          data: json
        }));
    }
    case ra.DELETE_MANY: {
      const list = params.ids.map((id) => `"${id}"`).join(',');
      return fetchApi(resource, {
        id: `in.(${list})`,
      }, {
        method: 'DELETE',
      })
        .then(response => {
          if (response.ok) {
            return {
              data: params.ids,
            };
          } else {
            return Promise.reject();
          }
        });
    }
    default:
      return Promise.reject();
  }
};

export default foreignMapProvider;
