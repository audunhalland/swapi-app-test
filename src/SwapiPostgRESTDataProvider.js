import postgRESTDataProvider from './PostgRESTDataProvider';

const foreignMap = {
  planet: [
  ],
  lifeform: [
  ],
  character: [
  ],
  starship: [
  ],
  vehicle: [
  ],
  film: [
  ],
}

const dataProvider = postgRESTDataProvider(foreignMap);

export default dataProvider;
