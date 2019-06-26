import React, { Component } from 'react';

import { Divider, Form, Grid, Header, Input, List, Segment } from 'semantic-ui-react';
import {BrowserRouter as Router, Route, NavLink} from 'react-router-dom';
import {v4 as uuid} from 'uuid';

import Amplify, { API, graphqlOperation, Storage, Auth } from 'aws-amplify';
import { Connect, S3Image, withAuthenticator } from 'aws-amplify-react';

import aws_exports from './aws-exports';

Amplify.configure(aws_exports);


function makeComparator(key, order='asc') {
  return (a, b) => {
    if(!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) return 0; 

    const aVal = (typeof a[key] === 'string') ? a[key].toUpperCase() : a[key];
    const bVal = (typeof b[key] === 'string') ? b[key].toUpperCase() : b[key];

    let comparison = 0;
    if (aVal > bVal) comparison = 1;
    if (aVal < bVal) comparison = -1;

    return order === 'desc' ? (comparison * -1) : comparison
  };
}


const ListAlbums = `query ListAlbums {
    listAlbums(limit: 9999) {
        items {
            id
            name
        }
    }
}`;

const SubscribeToNewAlbums = `
  subscription OnCreateAlbum {
    onCreateAlbum {
      id
      name
    }
  }
`;


const GetAlbum = `query GetAlbum($id: ID!, $nextTokenForPhotos: String) {
  getAlbum(id: $id) {
  id
  name
  photos(sortDirection: DESC, nextToken: $nextTokenForPhotos) {
    nextToken
    items {
      id
      thumbnail {
        width
        height
        key
      }
    }
  }
}
}
`;

const NewPhoto = `mutation NewPhoto($bucket: String!, $fullsize: PhotoS3InfoInput!, $thumbnail: PhotoS3InfoInput!, $photoAlbumId: ID) {
  createPhoto(input:{
    bucket: $bucket
    fullsize: $fullsize
    thumbnail: $thumbnail
    photoAlbumId: $photoAlbumId
  }) {
    id
    bucket
  }
}
`;

const DeltePhoto = `mutation DeletePhoto($id: ID!) {
  deletePhoto(input:{
    id: $id
  }) {
    id
  }
}
`;

class NewS3Photo extends React.Component {
  constructor(props) {
    super(props)
    this.state = {permission: 'public'}
  }

  render() {
    return (
      <Segment>
        <Header as='h3'>Upload your photo</Header>
        <select value={this.state.permission} onChange={(e)=>this.setState({permission: e.target.value})}>
          <option value="public">public</option>
          <option value="private">private</option>
          <option value="protected">protected</option>
        </select>
        <S3Image picker imgKey='test' level={this.state.permission} />
        {/* <S3Image imgKey='test' level='protected' identityId='us-east-1:bc802af1-4d96-44b2-ae58-fcc97256c965'/> */}
      </Segment>
    );
  }
}
class S3ImageUpload extends React.Component {
  constructor(props) {
    super(props);
    this.state = { uploading: false , permission: 'public'}
  }

  uploadFile = async (file) => {
    const fileName = uuid();
    const user = await Auth.currentAuthenticatedUser();
    
    console.log('file meta:', file);

    const result = await Storage.put(
      fileName, 
      file, 
      {
        //customPrefix: { public: 'uploads/' },
        level: this.state.permission,
        metadata: { albumid: this.props.albumId, owner: user.username }
      }
    );

    console.log('Uploaded file: ', result);

    const result_api = await API.graphql(graphqlOperation(NewPhoto, { bucket: aws_exports.aws_user_files_s3_bucket, 
      fullsize: {
        key: result.key,
        width: 200,
        height: 200
      }, 
      thumbnail: {
        key: result.key,
        width: 100,
        height: 100
      }, 
      photoAlbumId: this.props.albumId
    }));
    console.log(result_api);
  }

  onChange = async (e) => {
    this.setState({uploading: true});
    
    let files = [];
    for (var i=0; i<e.target.files.length; i++) {
      files.push(e.target.files.item(i));
    }
    await Promise.all(files.map(f => this.uploadFile(f)));

    this.setState({uploading: false});
  }

  render() {
    return (
      <div>
        <Form.Button
          onClick={() => document.getElementById('add-image-file-input').click()}
          disabled={this.state.uploading}
          icon='file image outline'
          content={ this.state.uploading ? 'Uploading...' : 'Add Images' }
        />
        <input
          id='add-image-file-input'
          type="file"
          accept='image/*'
          multiple
          onChange={this.onChange}
          style={{ display: 'none' }}
        />
        <select value={this.state.permission} onChange={(e)=>this.setState({permission: e.target.value})}>
          <option value="public">public</option>
          <option value="private">private</option>
        </select>
        <S3Image picker imgKey='test' level={this.state.permission} />
      </div>
    );
  }
}


class PhotosList extends React.Component {
photoItems() {
  console.log(this.props);
  // var s3 = new AWS.S3(new AWS.Credentials(( Auth.currentAuthenticatedUser)));
  // var params = {Bucket: "photo-albums83cdbd80218f4df89266735177933689-env", Key: "demoimg.jpg" };
  // var url = s3.getSignedUrl("getObject", params);
  // console.log(url);
  return <S3Image imgKey="1d7c3e8f-e97f-47b7-bd50-0563da56aaae"
      //imgKey="9413661b-fed1-42e6-82c3-2361c48d1f67" level='private'
    //imgKey="f7aaccda-7a5e-4e03-8d0d-cb1c6a3b3bff"
    style={{display: 'inline-block', 'paddingRight': '5px'}}
    />
  return this.props.photos.map(photo =>
    <S3Image 
      imgKey={photo.thumbnail.key} 
      //level= {photo.permission}
      style={{display: 'inline-block', 'paddingRight': '5px'}}
      photoId = {photo.id}
    />
  );
}

render() {
  return (
    <div>
      <Divider hidden />
      {this.photoItems()}
    </div>
  );
}
}


class NewAlbum extends Component {
  constructor(props) {
    super(props);
    this.state = {
      albumName: ''
      };
    }

  handleChange = (event) => {
    let change = {};
    change[event.target.name] = event.target.value;
    this.setState(change);
  }

  handleSubmit = async (event) => {
    event.preventDefault();
    const NewAlbum = `mutation NewAlbum($name: String!) {
      createAlbum(input: {name: $name}) {
        id
        name
      }
    }`;
    
    const result = await API.graphql(graphqlOperation(NewAlbum, { name: this.state.albumName }));
    console.info(`Created album with id ${result.data.createAlbum.id}`);
    this.setState({ albumName: '' })
  }

  render() {
    return (
      <Segment>
        <Header as='h3'>Add a new album</Header>
          <Input
          type='text'
          placeholder='New Album Name'
          icon='plus'
          iconPosition='left'
          action={{ content: 'Create', onClick: this.handleSubmit }}
          name='albumName'
          value={this.state.albumName}
          onChange={this.handleChange}
          />
        </Segment>
      )
    }
}


class AlbumsList extends React.Component {
  albumItems() {
    return this.props.albums.sort(makeComparator('name')).map(album =>
      <List.Item key={album.id}>
        <NavLink to={`/albums/${album.id}`}>{album.name}</NavLink>
      </List.Item>
    );
  }

  render() {
    return (
      <Segment>
        <Header as='h3'>My Albums</Header>
        <List divided relaxed>
          {this.albumItems()}
        </List>
      </Segment>
    );
  }
}


class AlbumDetailsLoader extends React.Component {
  constructor(props) {
      super(props);

      this.state = {
          nextTokenForPhotos: null,
          hasMorePhotos: true,
          album: null,
          loading: true
      }
  }

  async loadMorePhotos() {
      if (!this.state.hasMorePhotos) return;

      this.setState({ loading: true });
      const { data } = await API.graphql(graphqlOperation(GetAlbum, {id: this.props.id, nextTokenForPhotos: this.state.nextTokenForPhotos}));
      console.log(data);
      let album;
      if (this.state.album === null) {
          album = data.getAlbum;
      } else {
          album = this.state.album;
          album.photos.items = album.photos.items.concat(data.getAlbum.photos.items);
      }
      this.setState({ 
          album: album,
          loading: false,
          nextTokenForPhotos: data.getAlbum.photos.nextToken,
          hasMorePhotos: data.getAlbum.photos.nextToken !== null
      });
  }

  componentDidMount() {
      this.loadMorePhotos();
  }

  render() {
      return (
          <AlbumDetails 
              loadingPhotos={this.state.loading} 
              album={this.state.album} 
              loadMorePhotos={this.loadMorePhotos.bind(this)} 
              hasMorePhotos={this.state.hasMorePhotos} 
          />
      );
  }
}


class AlbumDetails extends Component {
  render() {
      if (!this.props.album) return 'Loading album...';
      
      return (
          <Segment>
          <Header as='h3'>{this.props.album.name}</Header>
          <S3ImageUpload albumId={this.props.album.id}/>        
          <PhotosList photos={this.props.album.photos.items} />
          {
              this.props.hasMorePhotos && 
              <Form.Button
              onClick={this.props.loadMorePhotos}
              icon='refresh'
              disabled={this.props.loadingPhotos}
              content={this.props.loadingPhotos ? 'Loading...' : 'Load more photos'}
              />
          }
          </Segment>
      )
  }
}


class AlbumsListLoader extends React.Component {
    onNewAlbum = (prevQuery, newData) => {
        // When we get data about a new album, we need to put in into an object 
        // with the same shape as the original query results, but with the new data added as well
        let updatedQuery = Object.assign({}, prevQuery);
        updatedQuery.listAlbums.items = prevQuery.listAlbums.items.concat([newData.onCreateAlbum]);
        return updatedQuery;
    }

    render() {
        return (
            <Connect 
                query={graphqlOperation(ListAlbums)}
                subscription={graphqlOperation(SubscribeToNewAlbums)} 
                onSubscriptionMsg={this.onNewAlbum}
            >
                {({ data, loading }) => {
                    if (loading) { return <div>Loading...</div>; }
                    if (!data.listAlbums) return;
                return <AlbumsList albums={data.listAlbums.items} />;
                }}
            </Connect>
        );
    }
}


class App extends Component {
  render() {
    return (
      <Router>
        <Grid padded>
          <Grid.Column>
            <Route path="/" exact component={NewAlbum}/>
            <Route path="/" exact component={AlbumsListLoader}/>
            <Route path="/" exact component={NewS3Photo}/>

            <Route
              path="/albums/:albumId"
              render={ () => <div><NavLink to='/'>Back to Albums list</NavLink></div> }
            />
            <Route
              path="/albums/:albumId"
              render={ props => <AlbumDetailsLoader id={props.match.params.albumId}/> }
            />
          </Grid.Column>
        </Grid>
      </Router>
    );
  }
}

export default withAuthenticator(App, {includeGreetings: true});