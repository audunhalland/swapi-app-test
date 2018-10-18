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
      films: {
        table: 'character_films',
        source: 'character_id',
        target: 'film_id',
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
    arrayFields: {
      planets: {
        table: 'planet_films',
        source: 'film_id',
        target: 'planet_id',
      },
      lifeforms: {
        table: 'lifeform_films',
        source: 'film_id',
        target: 'lifeform_id',
      },
      characters: {
        table: 'character_films',
        source: 'film_id',
        target: 'character_id',
      },
      starships: {
        table: 'starship_films',
        source: 'film_id',
        target: 'starship_id',
      },
      vehicles: {
        table: 'vehicle_films',
        source: 'film_id',
        target: 'vehicle_id',
      },

    },
  },
}

const dataProvider = postgRESTDataProvider(config);

export default dataProvider;
