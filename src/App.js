import React from 'react';
import * as ra from 'react-admin';
import dataProvider from './SwapiPostgRESTDataProvider';

const FilmList = (props) => (
  <ra.List {...props}>
    <ra.Datagrid>
      <ra.TextField source="title" />
    </ra.Datagrid>
  </ra.List>
);

const NameList = (props) => (
  <ra.List {...props}>
    <ra.Datagrid>
      <ra.TextField source="name" />
    </ra.Datagrid>
  </ra.List>
);

const CharacterList = (props) => (
  <ra.List {...props}>
    <ra.Datagrid>
      <ra.TextField source="name" />
      <ra.ReferenceArrayField source="lifeforms" reference="lifeform">
        <ra.SingleFieldList>
          <ra.ChipField source="name" />
        </ra.SingleFieldList>
      </ra.ReferenceArrayField>
      <ra.ReferenceField source="homeworld" reference="planet">
        <ra.TextField source="name" />
      </ra.ReferenceField>
    </ra.Datagrid>
  </ra.List>
);

const StarshipList = (props) => (
  <ra.List {...props}>
    <ra.Datagrid>
      <ra.TextField source="name" />
      <ra.ReferenceArrayField source="pilots" reference="character">
        <ra.SingleFieldList>
          <ra.ChipField source="name" />
        </ra.SingleFieldList>
      </ra.ReferenceArrayField>
    </ra.Datagrid>
  </ra.List>
);

const App = () => (
  <ra.Admin
    title='Star Wars CMS'
    dataProvider={dataProvider}
  >
    <ra.Resource name="planet" list={NameList} />
    <ra.Resource name="lifeform" list={NameList} />
    <ra.Resource name="character" list={CharacterList} />
    <ra.Resource name="starship" list={StarshipList} />
    <ra.Resource name="vehicle" list={NameList} />
    <ra.Resource name="film" list={FilmList} />
  </ra.Admin>
);

export default App;
