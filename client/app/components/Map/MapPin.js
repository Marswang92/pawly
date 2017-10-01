import React, { Component } from 'react';
import { View, Image, StyleSheet } from 'react-native';

export default class MapPin extends Component {
  render() {
    const { data, isSelected } = this.props;

    return (
      <View
        style={[styles.container, {
          height: 70,
          width: 70,
        }]}
      >
        <Image
          source={require('../../assets/img/map-marker.png')}
          style={{
            width: 70,
            height: 70,
            resizeMode: 'stretch'
          }}
        />
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: data.image }}
            style={styles.image}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontStyle: 'italic',
    backgroundColor: 'transparent'
  },
  imageContainer: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    justifyContent: 'center',
    zIndex: -1,
    alignItems: 'center',
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  }
});