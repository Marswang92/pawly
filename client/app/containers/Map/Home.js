import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Animated,
  Dimensions,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import MapView from 'react-native-maps';
import LinearGradient from 'react-native-linear-gradient';
import MapPin from '../../components/Map/MapPin';
import * as sessionActions from '../../reducers/session';
import * as pictureActions from '../../reducers/picture';
import Carousel from '../../components/Helpers/Carousel';
import PictureCard from './PictureCard';

const { width, height } = Dimensions.get('window');

class Home extends Component {
  constructor() {
    super();
    this.state = {
      opacityAnim: new Animated.Value(0),
      region: {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.1500,
        longitudeDelta: 0.1500,
      },
      selectedPicture: undefined,
      selectedPictureId: -1,
    };
    this.renderPicture = this.renderPicture.bind(this);
    this.onRegionChange = this.onRegionChange.bind(this);
    this.redoMapSearch = this.redoMapSearch.bind(this);
  }

  componentDidMount() {
    this._locationReceived = false;
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      this.getInitialAndroid23Location();
    } else {
      this.getInitialLocation();
    }
  }

  componentWillReceiveProps(nextProps) {
    // Update the center of the location
    if (nextProps.currentLocation !== this.props.currentLocation && !this.updatedLocation) {
      this.setState({
        region: {
          longitude: nextProps.currentLocation.coords.longitude,
          latitude: nextProps.currentLocation.coords.latitude,
          latitudeDelta: 0.1500,
          longitudeDelta: 0.1500,
        }
      });
      this.updatedLocation = true;
    }
  }

  getInitialAndroid23Location = async() => {
    try {
      // Asking for permission, then get location.
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          'title': 'Location',
          'message': 'Access to your location ' +
                    'for some reason.'
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        this.getInitialLocation();
      } else {
        console.log('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  getInitialLocation = () => {
    // Getting Geolocation data.
    this.setState({ isFetchingLocation: true });
    navigator.geolocation.getCurrentPosition(
      // Once get current location, fetch dishes and restaurants
      (position) => {
        this.setState({
          isLocationAuthorized: true,
          isFetchingLocation: false,
        });
        this.props.dispatch({
          type: sessionActions.SET_LOCATION_AUTH,
          isLocationAuthed: true,
        });
        this.props.dispatch({
          type: sessionActions.SET_CURRENT_LOCATION,
          loc: position,
        });
        this.props.dispatch({
          type: pictureActions.FETCH_NEARBY,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: this.state.region.latitudeDelta / 2,
          longitudeDelta: this.state.region.longitudeDelta / 2,
          list: 'initialize',
          token: this.props.currentUser.accessToken,
        });
      },
      (error) => this.setState({
        isLocationAuthorized: false,
        isFetchingLocation: false,
        fetchLocationError: true,
      }),
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 1000 }
    );
    this.watchID = navigator.geolocation.watchPosition((position) => {
      this.props.dispatch({
        type: sessionActions.SET_CURRENT_LOCATION,
        loc: position
      });
    });
  };

  selectPlace(place) {
    this.setState({ selectedPlace: place });
    this.isSelecting = true;
    Animated.spring(
      this.state.opacityAnim,
      {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      },
    ).start(() => {
      this.isSelecting = false;
    });
    const { latitudeDelta, longitudeDelta } = this.state.region;

    this.map.animateToRegion({
      longitude: place.longitude,
      latitude: place.latitude - latitudeDelta / 3,
      latitudeDelta,
      longitudeDelta,
    });
  }

  deselectPlace() {
    this.setState({ selectedPlace: undefined });
    this._carousel && this._carousel.snapToItem(-1);
    if (!this.isSelecting) {
      Animated.timing(
        this.state.opacityAnim,
        {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        },
      ).start(() => this.setState({
        selectedPlace: undefined,
      }) );
    }
  }

  snapCarousel(picture, i) {
    if (this.state.selectedPlace && picture.place.placeId !== this.state.selectedPlace.placeId) {
      this.selectPlace(picture.place);
    }
  }

  onRegionChange(region) {
    if (region.longitudeDelta < 0.2973655516254894) {
      this.setState({
        region,
        showRedoSearchButton: true,
      });
    } else {
      this.setState({
        region,
        showRedoSearchButton: false,
      });
    }
  }

  redoMapSearch() {
    this.props.dispatch({
      type: pictureActions.FETCH_NEARBY,
      latitude: this.state.region.latitude,
      longitude: this.state.region.longitude,
      latitudeDelta: this.state.region.latitudeDelta / 2,
      longitudeDelta: this.state.region.longitudeDelta / 2,
      list: 'location',
      token: this.props.currentUser.accessToken,
    });
  }

  renderMarkers() {
    const {
      placeList,
      locationList,
      currentLocation,
      mainTab,
    } = this.props;
    const { selectedPlace } = this.state;
    const markers = placeList &&
      placeList.map((place) => ({
        latlng: {
          latitude: place.latitude,
          longitude: place.longitude,
        },
        key: place.placeId,
        data: place,
    }));

    return  markers && markers.map((marker, i) => {
      const isSelected = (selectedPlace && selectedPlace.placeId) === marker.key;
      return (
        <MapView.Marker
          coordinate={marker.latlng}
          key={marker.key}
          style={{ zIndex: isSelected ? 100 : 0 }}
          onPress={(e) => {
            const pictureId = locationList.findIndex(picture =>
              picture.place.placeId === marker.key);
            e.preventDefault();
            e.stopPropagation();
            this.selectPlace(marker.data);
            this._carousel && this._carousel.snapToItem(pictureId);
          }}
        >
          <MapPin
            data={marker.data}
            isSelected={isSelected}
          />
        </MapView.Marker>
        );
    });
  }

  renderPicture({ item, index }) {
    const { navigation } = this.props;
    return (
      <PictureCard
        data={item}
        navigation={navigation}
        view={'Map'}
      />
    );
  }

  render() {
    const { locationList } = this.props;
    const { region, selectedPlace, opacityAnim, showRedoSearchButton } = this.state;
    const cardWidth = width - 30;
    return (
      <View style={styles.container}>
        <LinearGradient
          style={styles.header}
          start={{x: 0.0, y: 0.25}} end={{x: 0.5, y: 1.0}}
          colors={['#ECE9E6', '#ffffff']}
        >
          <Text style={styles.title}>Pawly Map</Text>
        </LinearGradient>
        { locationList && (
          <Animated.View
            style={[styles.cardContainer, {
              opacity: opacityAnim,
              bottom: selectedPlace ? 60 : -300,
            }]}
          >
            <Carousel
              sliderWidth={width}
              itemWidth={cardWidth}
              enableSnap
              onSnapToItem={(i) => this.snapCarousel(locationList[i], i)}
              ref={(carousel) => { this._carousel = carousel; }}
              data={locationList}
              renderItem={this.renderPicture}
            />
          </Animated.View>
        )}
        <View style={styles.container}>
          { showRedoSearchButton && (
            <TouchableOpacity
              style={styles.redoButton}
              onPress={this.redoMapSearch}
            >
              <LinearGradient
                style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                start={{x: 0.0, y: 0.25}} end={{x: 0.5, y: 1.0}}
                colors={['#4568DC', '#B06AB3']}
              >
                <Text
                  style={{
                    color: 'white',
                    fontFamily: 'Lato',
                    fontSize: 14,
                    backgroundColor: 'transparent'
                  }}
                >
                  Redo search in this area
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ) }
          <MapView
            style={styles.map}
            region={region}
            pitchEnabled={false}
            ref={map => this.map = map}
            onRegionChange={this.onRegionChange}
            onPress={() => this.deselectPlace()}
          >
            { locationList && this.renderMarkers() }
          </MapView>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardContainer: {
    flex: 0,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 4,
  },
  icon: {
    marginRight: (Platform.OS === 'ios') ? 40 : 20,
    marginTop: -2,
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    height: 60,
    paddingTop: 19,
    alignItems:'center',
    justifyContent:'center'
  },
  title: {
    color: 'black',
    fontFamily: 'Berlin Bold',
    letterSpacing: 1,
    fontSize: 20,
    fontWeight: '600',
    backgroundColor: 'transparent',
  },
  redoButton: {
    zIndex: 10,
    borderRadius: 8,
    position: 'absolute',
    height: 30,
    top: 20,
    left: width <= 325 ? 30 : 50,
    right: width <= 325 ? 30 : 50,
    overflow: 'hidden',
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
    currentLocation: state.session.currentLocation,
    locationList: state.picture.locationList.toJS(),
    placeList: state.picture.placeList.toJS(),
  };
};


export default connect(mapStateToProps)(Home);
