import postgRESTDataProvider from './PostgRESTDataProvider';

const config = {
  planet: {
    filter: 'name',
    arrayFields: {},
  },
  lifeform: {
    filter: 'name',
    arrayFields: {},
  },
  character: {
    filter: 'name',
    arrayFields: {
      lifeforms: {
        table: 'character_lifeforms',
        source: 'character_id',
        target: 'lifeform_id',
      },
    }
  },
  starship: {
    filter: 'name',
    arrayFields: {
      pilots: {
        table: 'starship_pilots',
        source: 'starship_id',
        target: 'character_id',
      },
    }
  },
  vehicle: {
    filter: 'name',
    arrayFields: {
      pilots: {
        table: 'vehicle_pilots',
        source: 'vehicle_id',
        target: 'character_id',
      },
    }
  },
  film: {
    filter: 'title',
    arrayFields: {},
  },
}

const dataProvider = postgRESTDataProvider(config);

export default dataProvider;
