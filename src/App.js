import React from 'react';
import {
  Admin, Resource,
  List, Create, Show,
  Datagrid, SimpleForm, SingleFieldList, SimpleShowLayout,
  ShowButton,
  TextField, RichTextField, ChipField,
  ReferenceField, ReferenceArrayField,
  LongTextInput, SelectInput, SelectArrayInput, AutocompleteArrayInput,
  ReferenceInput, ReferenceArrayInput
} from 'react-admin';
import dataProvider from './SwapiPostgRESTDataProvider';

const NameList = (props) => (
  <List {...props}>
    <Datagrid>
      <TextField source="name" />
    </Datagrid>
  </List>
);

const FilmList = (props) => (
  <List {...props}>
    <Datagrid>
      <TextField source="title" />
      <ShowButton />
    </Datagrid>
  </List>
);

const FilmShow = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="title" />
      <TextField source="director" />
      <TextField source="producer" />
      <ReferenceArrayField source="characters" reference="character">
        <SingleFieldList>
          <ChipField source="name" />
        </SingleFieldList>
      </ReferenceArrayField>
    </SimpleShowLayout>
  </Show>
);

const CharacterCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <LongTextInput source="name" />
      <ReferenceArrayInput source="films" reference="film">
        <SelectArrayInput optionText="title" />
      </ReferenceArrayInput>
    </SimpleForm>
  </Create>
);

const App = () => (
  <Admin
    title='Star Wars CMS'
    dataProvider={dataProvider}
  >
    <Resource name="planet" list={NameList}/>
    <Resource name="lifeform" list={NameList} />
    <Resource name="character" list={NameList} create={CharacterCreate}/>
    <Resource name="starship" list={NameList} />
    <Resource name="vehicle" list={NameList} />
    <Resource name="film" list={FilmList} show={FilmShow}/>
  </Admin>
);

export default App;
