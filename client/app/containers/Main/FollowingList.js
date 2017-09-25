import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  FlatList,
  Platform,
  StyleSheet,
} from 'react-native';
import PictureCard from './PictureCard';
import * as actions from '../../reducers/picture';

const picList = [
  {
    image: 'https://images.pexels.com/photos/39317/chihuahua-dog-puppy-cute-39317.jpeg?w=1260&h=750&auto=compress&cs=tinysrgb',
    creator: { name: 'marswang92', avatar: 'https://static.pexels.com/photos/212286/pexels-photo-212286.jpeg' },
    pets: [
      {
        name: 'Zoey',
        avatar: 'https://images.pexels.com/photos/39317/chihuahua-dog-puppy-cute-39317.jpeg?w=1260&h=750&auto=compress&cs=tinysrgb',
      },
      {
        name: 'Zoey',
        avatar: 'https://images.pexels.com/photos/39317/chihuahua-dog-puppy-cute-39317.jpeg?w=1260&h=750&auto=compress&cs=tinysrgb',
      },
      {
        name: 'Zoey',
        avatar: 'https://images.pexels.com/photos/39317/chihuahua-dog-puppy-cute-39317.jpeg?w=1260&h=750&auto=compress&cs=tinysrgb',
      }
    ],
    pictureId: 1,
    likers: ['sunghian79'],
    comments: [
      { username: 'sunghian79', text: 'She is so cute!' },
      { username: 'sunghian79', text: 'She is so cute!' },
    ]
  },
  {
    image: 'https://images.pexels.com/photos/39317/chihuahua-dog-puppy-cute-39317.jpeg?w=1260&h=750&auto=compress&cs=tinysrgb',
    creator: { name: 'marswang92', avatar: 'https://static.pexels.com/photos/212286/pexels-photo-212286.jpeg' },
    pets: [{
      name: 'Zoey',
      avatar: 'https://images.pexels.com/photos/39317/chihuahua-dog-puppy-cute-39317.jpeg?w=1260&h=750&auto=compress&cs=tinysrgb',
    }],
    pictureId: 2,
    likers: ['sunghian79', 'nat'],
    comments: [
      { username: 'sunghian79', text: 'She is so cute!' },
      { username: 'sunghian79', text: 'She is so cute!' },
    ]
  }
];

class FollowingList extends Component {
  componentDidMount() {
    this.props.dispatch({
      type: actions.FETCH_FEED,
      token: this.props.currentUser.accessToken,
    });
    this.onRefresh = this.onRefresh.bind(this);
  }

  onRefresh() {
    this.props.dispatch({
      type: actions.FETCH_FEED,
      token: this.props.currentUser.accessToken,
    });
  }

  render() {
    const { isLoading, followingList } = this.props;
    return (
      <FlatList
        data={followingList.toJS()}
        removeClippedSubviews={false}
        refreshing={isLoading}
        onRefresh={this.onRefresh}
        style={styles.container}
        keyExtractor={(item) => (item.pictureId)}
        renderItem={({ item }) => (
          <PictureCard data={item} />
        )}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    marginBottom: 45,
  },
  icon: {
    marginLeft: (Platform.OS === 'ios') ? 40 : 20,
    marginTop: -2,
  },
  titleContainer: {
    backgroundColor:'#2e2e2e',
    padding: 12,
    alignItems:'center',
    justifyContent:'center'
  },
  title: {
    fontSize: 18,
    color: 'white',
    letterSpacing: 2,
    fontWeight: '600'
  },
  bgImg: {
    flex: 1,
    width: '100%',
    alignItems:'center',
    justifyContent:'center'
  },
});

const mapStateToProps = (state) => {
  return {
    currentUser: state.session.currentUser,
    followingList: state.picture.followingList,
    isLoading: state.picture.isFetchingFeed,
  };
};


export default connect(mapStateToProps)(FollowingList);