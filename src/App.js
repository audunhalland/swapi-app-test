import React, { Component } from 'react';
import * as ra from 'react-admin';
import buildOpenCrudProvider from 'ra-data-opencrud';

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

class App extends Component {
  constructor() {
    super();
    this.state = { dataProvider: null };
  }
  componentDidMount() {
    buildOpenCrudProvider({ clientOptions: { uri: 'http://localhost:4466/' } })
      .then(dataProvider => this.setState({ dataProvider }));
  }

  render() {
    const { dataProvider } = this.state;

    if (!dataProvider) {
      return <div>Loading</div>;
    }

    return (
      <ra.Admin dataProvider={dataProvider}>
        <ra.Resource name="Planet" list={NameList} />
        <ra.Resource name="Lifeform" list={NameList} />
        <ra.Resource name="Character" list={NameList} />
        <ra.Resource name="Starship" list={NameList} />
        <ra.Resource name="Vehicle" list={NameList} />
        <ra.Resource name="Film" list={FilmList} />
      </ra.Admin>
    );
  }
}

export default App;
