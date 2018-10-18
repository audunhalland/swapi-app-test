import * as ra from 'react-admin';

// Using node proxy
const baseUrl = '';

const verifyResponse = (response) => (response.ok ? response : Promise.reject());

const apiToReactAdmin = (obj, resource, joinMap) => {
  const joinConfig = joinMap[resource];
  const overridden = Object.keys(joinConfig).reduce((agg, key) => {
    agg[key] = obj[key].map(foreignObj => (
      foreignObj[joinConfig[key]['target']]
    ));
    return agg;
  }, {});
  return {
    ...obj,
    ...overridden,
  };
};

// Filter out foreign/join table values
const reactAdminToRawApi = (obj, resource, joinMap) => {
  const joinConfig = joinMap[resource];
  const newObj = {...obj};
  Object.keys(joinConfig).forEach(key => {
    delete newObj[key];
  });
  return newObj;
};

const convertListResponse = (response, type, resource, joinMap) => {
  const contentRange = response.headers.get('content-range');
  const splitRange = contentRange && contentRange.match(/([0-9]+)-([0-9]+)\/([0-9]+)/);
  return response.json()
    .then(json => {
      console.log('response json: ', json);
      return json;
    })
    .then(json => ({
      data: json.map(obj => apiToReactAdmin(obj, resource, joinMap)),
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
  return fetch(url, options)
    .then(verifyResponse);
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

const createSelectQuery = (joinMap, type, resource, params) => {
  const joinConfig = joinMap[resource];
  const query = {};
  if (joinConfig && Object.keys(joinConfig).length) {
    query['select'] = '*,' +
      Object.keys(joinConfig)
        .map(key => (
          `${key}:${joinConfig[key]['table']}(${joinConfig[key]['target']})`
        ))
        .join(',');
  }
  if (type === ra.GET_ONE && params.id) {
    query['id'] = `eq.${params.id}`;
  }
  if (type === ra.GET_MANY && params.ids) {
    const list = params.ids.map((id) => `"${id}"`).join(',');
    query['id'] = `in.(${list})`;
  }
  return query;
};

const getList = (type, resource, params, joinMap) => {
  return fetchApi(resource,
    createSelectQuery(joinMap, type, resource, params),
    { headers: createHeaders(params) }
  )
    .then(response => convertListResponse(response, type, resource, joinMap));
};

const getOne = (type, resource, params, joinMap) => {
  return getList(type, resource, params, joinMap)
    .then(listResponse => ({
      data: listResponse.data[0],
    }));
}

const create = (type, resource, params, joinMap) => {
  return fetchApi(resource, {},
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(reactAdminToRawApi(params.data, resource, joinMap)),
    })
    .then(response => response.json())
    .then(mainJson => {
      const joinConfig = joinMap[resource];
      const joinPromises = Object.keys(joinConfig).map(key => {
        const joinTable = joinConfig[key];
        console.log('join create: ', params.data, ' key: ', key);
        return fetchApi(joinTable['table'], {}, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            (params.data[key] || []).map(targetForeignKey => ({
              [joinTable['source']]: mainJson.id,
              [joinTable['target']]: targetForeignKey,
            }))
          )})
          .then(response => response.text());
      });
      return Promise.all([
        Promise.resolve(mainJson[0]),
        ...joinPromises
      ]);
    })
    .then(allJsons => {
      console.log('allJsons: ', allJsons);
      return getOne(ra.GET_ONE, resource, { id: allJsons[0].id }, joinMap);
    });
}

const deleteMany = async (type, resource, params, joinMap) => {
  const list = params.ids.map((id) => `"${id}"`).join(',');
  await fetchApi(resource,
    { id: `in.(${list})` },
    { method: 'DELETE' },
  );
  return {
    data: params.ids,
  };
};

const joinMapProvider = joinMap => (type, resource, params) => {
  console.log('request: ', type, resource, params);
  switch (type) {
    case ra.GET_ONE:
      return getOne(type, resource, params, joinMap);
    case ra.GET_LIST:
    case ra.GET_MANY:
      return getList(type, resource, params, joinMap);
    case ra.CREATE:
      return create(type, resource, params, joinMap);
    case ra.DELETE_MANY:
      return deleteMany(type, resource, params, joinMap);
    default:
      return Promise.reject();
  }
};

export default joinMapProvider;
