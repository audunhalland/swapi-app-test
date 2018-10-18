import postgRESTDataProvider from './PostgRESTDataProvider';

const foreignMap = {
  planet: {
  },
  lifeform: {
  },
  character: {
    lifeforms: ['character_lifeforms', 'lifeform_id'],
  },
  starship: {
    pilots: ['starship_pilots', 'character_id'],
  },
  vehicle: {
    pilots: ['vehicle_pilots', 'character_id'],
  },
  film: {
  },
}

const dataProvider = postgRESTDataProvider(foreignMap);

export default dataProvider;
