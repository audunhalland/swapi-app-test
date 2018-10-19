import React from 'react';
import * as ra from 'react-admin';
import dataProvider from './SwapiPostgRESTDataProvider';

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

const CharacterForm = (props) => (
  <ra.SimpleForm {...props}>
    <ra.LongTextInput source="name" />
    <ra.LongTextInput source="mass" />
    <ra.LongTextInput source="hair_color" />
    <ra.LongTextInput source="skin_color" />
    <ra.LongTextInput source="eye_color" />
    <ra.LongTextInput source="birth_year" />
    <ra.LongTextInput source="gender" />
    <ra.ReferenceInput source="homeworld" reference="planet">
      <ra.SelectInput optionText="name" />
    </ra.ReferenceInput>
    <ra.ReferenceArrayInput
      label="Lifeforms"
      source="lifeforms"
      reference="lifeform"
      allowEmpty
    >
      <ra.AutocompleteArrayInput />
    </ra.ReferenceArrayInput>
    <ra.ReferenceArrayInput
      label="films"
      source="films"
      reference="film"
      allowEmpty
    >
      <ra.SelectArrayInput optionText="title" />
    </ra.ReferenceArrayInput>
  </ra.SimpleForm>
);

const CharacterCreate = (props) => (
  <ra.Create {...props}>
    <CharacterForm />
  </ra.Create>
);

const FilmList = (props) => (
  <ra.List {...props}>
    <ra.Datagrid>
      <ra.TextField source="title" />
      <ra.ShowButton />
    </ra.Datagrid>
  </ra.List>
);

const FilmShow = (props) => (
  <ra.Show {...props}>
    <ra.SimpleShowLayout>
      <ra.TextField source="title" />
      <ra.TextField source="director" />
      <ra.RichTextField source="opening_crawl" />
      <ra.ReferenceArrayField source="planets" reference="planet">
        <ra.Datagrid>
          <ra.TextField source="name" />
          <ra.TextField source="terrain" />
          <ra.TextField source="climate" />
          <ra.ShowButton />
        </ra.Datagrid>
      </ra.ReferenceArrayField>
      <ra.ReferenceArrayField source="characters" reference="character">
        <ra.SingleFieldList>
          <ra.ChipField source="name" />
        </ra.SingleFieldList>
      </ra.ReferenceArrayField>
      <ra.ReferenceArrayField source="starships" reference="starship">
        <ra.SingleFieldList>
          <ra.ChipField source="name" />
        </ra.SingleFieldList>
      </ra.ReferenceArrayField>
      <ra.ReferenceArrayField source="vehicles" reference="vehicle">
        <ra.SingleFieldList>
          <ra.ChipField source="name" />
        </ra.SingleFieldList>
      </ra.ReferenceArrayField>

    </ra.SimpleShowLayout>
  </ra.Show>
);

const App = () => (
  <ra.Admin
    title='Star Wars CMS'
    dataProvider={dataProvider}
  >
    <ra.Resource name="planet" list={NameList} />
    <ra.Resource name="lifeform" list={NameList} />
    <ra.Resource name="character" list={CharacterList} create={CharacterCreate}/>
    <ra.Resource name="starship" list={NameList} />
    <ra.Resource name="vehicle" list={NameList} />
    <ra.Resource name="film" list={FilmList} show={FilmShow}/>
  </ra.Admin>
);

export default App;
