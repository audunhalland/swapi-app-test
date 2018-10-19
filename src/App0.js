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

const App = () => (
  <Admin
    title='Star Wars CMS'
    dataProvider={dataProvider}
  >
  </Admin>
);

export default App;
