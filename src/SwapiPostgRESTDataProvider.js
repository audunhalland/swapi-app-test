import postgRESTDataProvider from './PostgRESTDataProvider';

const joinMap = {
  planet: {
  },
  lifeform: {
  },
  character: {
    lifeforms: {
      table: 'character_lifeforms',
      source: 'character_id',
      target: 'lifeform_id',
    },
  },
  starship: {
    pilots: {
      table: 'starship_pilots',
      source: 'starship_id',
      target: 'character_id',
    },
  },
  vehicle: {
    pilots: {
      table: 'vehicle_pilots',
      source: 'vehicle_id',
      target: 'character_id',
    },
  },
  film: {
  },
}

const dataProvider = postgRESTDataProvider(joinMap);

export default dataProvider;
