import * as ra from 'react-admin';

// Using node proxy
const baseUrl = '';

const verifyResponse = async (response) => {
  if (response.ok) {
    return response;
  } else {
    const text = await response.text();
    throw new Error(text);
  }
}

const apiToReactAdmin = (obj, resource, config) => {
  const arrayFields = config[resource].arrayFields;
  const overridden = Object.keys(arrayFields).reduce((agg, key) => {
    agg[key] = obj[key].map(foreignObj => (
      foreignObj[arrayFields[key]['target']]
    ));
    return agg;
  }, {});
  return {
    ...obj,
    ...overridden,
  };
};

// Filter out foreign/join table values
const reactAdminToRawApi = (obj, resource, config) => {
  const arrayFields = config[resource].arrayFields;
  const newObj = {...obj};
  Object.keys(arrayFields).forEach(key => {
    delete newObj[key];
  });
  return newObj;
};

const convertListResponse = (response, type, resource, config) => {
  const contentRange = response.headers.get('content-range');
  const splitRange = contentRange && contentRange.match(/([0-9]+)-([0-9]+)\/([0-9]+)/);
  return response.json()
    .then(json => {
      console.log('response json: ', json);
      return json;
    })
    .then(json => ({
      data: json.map(obj => apiToReactAdmin(obj, resource, config)),
      ...splitRange && { total: parseInt(splitRange[3], 10) }
    }));
}

const fetchApi = async (resource, query, options) => {
  let url = baseUrl + '/' + resource;
  if (Object.keys(query).length > 0) {
    url += '?' + Object.keys(query)
      .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(query[k]))
      .join('&');
  }
  //console.log('fetch ', url, options);
  const response = await fetch(url, options);
  return await verifyResponse(response);
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

const createSelectQuery = (config, type, resource, params) => {
  const arrayFields = config[resource].arrayFields;
  const query = {};
  if (arrayFields && Object.keys(arrayFields).length) {
    query['select'] = '*,' +
      Object.keys(arrayFields)
        .map(key => (
          `${key}:${arrayFields[key]['table']}(${arrayFields[key]['target']})`
        ))
        .join(',');
  }
  if (params.filter && params.filter.q && config[resource].filter) {
    //const filterField = config[resource].filter;
    query[config[resource].filter] = `ilike.*${params.filter.q}*`;
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

const getList = (type, resource, params, config) => {
  return fetchApi(resource,
    createSelectQuery(config, type, resource, params),
    { headers: createHeaders(params) }
  )
    .then(response => convertListResponse(response, type, resource, config));
};

const getOne = async (type, resource, params, config) => {
  const listResponse = await getList(type, resource, params, config);
  return {
    data: listResponse.data[0],
  };
}

const create = async (type, resource, params, config) => {
  const response = await fetchApi(resource, {},
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(reactAdminToRawApi(params.data, resource, config)),
    }
  );
  const newObject = (await response.json())[0];

  // POST calls to insert array data into join tables
  const arrayFields = config[resource].arrayFields;
  await Promise.all(Object.keys(arrayFields).map(async key => {
    const joinTable = arrayFields[key];
    //console.log('join create: ', params.data, ' key: ', key);
    const response = await fetchApi(joinTable['table'], {}, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        (params.data[key] || []).map(targetForeignKey => ({
          [joinTable['source']]: newObject.id,
          [joinTable['target']]: targetForeignKey,
        }))
      )}
    );
    return await response.text();
  }));

  // Return value of CREATE should be the full object.
  return await getOne(ra.GET_ONE, resource, { id: newObject.id }, config);
}

const deleteMany = async (type, resource, params, config) => {
  const list = params.ids.map((id) => `"${id}"`).join(',');
  await fetchApi(resource,
    { id: `in.(${list})` },
    { method: 'DELETE' },
  );
  return {
    data: params.ids,
  };
};

const configProvider = config => (type, resource, params) => {
  console.log('request: ', type, resource, params);
  switch (type) {
    case ra.GET_ONE:
      return getOne(type, resource, params, config);
    case ra.GET_LIST:
    case ra.GET_MANY:
      return getList(type, resource, params, config);
    case ra.CREATE:
      return create(type, resource, params, config);
    case ra.DELETE_MANY:
      return deleteMany(type, resource, params, config);
    default:
      return Promise.reject();
  }
};

export default configProvider;
