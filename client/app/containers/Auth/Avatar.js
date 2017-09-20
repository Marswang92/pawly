import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import uuidv4 from 'uuid/v4';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ImageCropper from 'react-native-image-crop-picker';
import ImagePicker from 'react-native-image-picker';
import * as actions from '../../reducers/session';

const options = {
  title: 'Select Avatar',
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
};

class Avatar extends Component {
  constructor() {
    super();
    this.state = {
      avatarSource: '',
    };
    this.showImagePicker = this.showImagePicker.bind(this);
    this.updateUsername = this.updateUsername.bind(this);
  }

  showImagePicker() {
    this.setState({ isLoadingImage: true });
    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
        this.setState({ isLoadingImage: false });
      } else if (response.error) {
      } else {
        ImageCropper.openCropper({
          path: response.uri,
          width: 300,
          height: 300,
          compressImageQuality: 0.5,
          includeBase64: true,
        }).then(response => {
          // Put image in a form to upload
          let formData = new FormData();
          formData.append('avatar',
            { uri: response.path, name: `${uuidv4()}.jpg`, type: 'multipart/formdata' });
          this.props.dispatch({
            type: actions.UPLOAD_AVATAR,
            image: formData,
            token: this.props.currentUser.accessToken,
            callback: () => this.setState({ isLoadingImage: false }),
          });
        }).catch(error => {
          this.setState({ isLoadingImage: false });
        });
      }
    });
  }

  updateUsername() {
    this.props.setUsername(this.state.username);
  }

  render() {
    const { currentUser } = this.props;
    const { isLoadingImage } = this.state;

    let avatarUrl = currentUser && currentUser.avatar.url;
    if (!avatarUrl && currentUser && currentUser.facebookId) {
      avatarUrl = `https://graph.facebook.com/${currentUser.facebookId}/picture?width=9999`;
    }
    const imageSource = avatarUrl ? { uri: avatarUrl }
      : require('../../assets/img/user-default.png');

    return (
      <View style={styles.container}>
        { isLoadingImage && <View style={styles.overlay} /> }
        <TouchableOpacity onPress={this.showImagePicker}>
          <Image source={imageSource} style={styles.uploadAvatar} />
        </TouchableOpacity>
        <Text style={styles.title}>
          Choose a unique username
        </Text>
        <View style={styles.textInputContainer}>
          <Icon
            name={'account'}
            size={22}
            color={'white'}
            style={{ paddingHorizontal: 10 }}
          />
          <TextInput
            blurOnSubmit={ true }
            autoCapitalize={'none'}
            returnKeyType={ 'go' }
            placeholder={'8-20 characters'}
            placeholderTextColor={'rgba(255, 255, 255, 0.6)'}
            value={this.state.username}
            style={styles.textInput}
            onChangeText={(text) => this.setState({ username: text })}
            onSubmitEditing={this.updateUsername}
          />
        </View>
      </View>
    );
  }
}

const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 3,
  },
  title: {
    fontFamily: 'Lato',
    color: 'white',
    fontSize: 26,
    marginTop: 30,
    marginBottom: 15,
  },
  uploadAvatar: {
    height: 100,
    width: 100,
    borderRadius: 50,
    overflow: 'hidden',
  },
  textInputContainer: {
    flexDirection: 'row',
    height: 40,
    marginHorizontal: 30,
    marginVertical: 10,
    backgroundColor: 'rgba(200, 200, 200, 0.3)',
    borderRadius: 4,
    alignItems: 'center',
  },
  textInput: {
    fontSize: 16,
    color: '#fff',
    height: 40,
    width: width - 150,
  },
});

const mapStateToProps = (state) => {
  return {
    isCheckingUser: state.session.isCheckingUser,
    currentUser: state.session.currentUser,
  };
};

export default connect(mapStateToProps)(Avatar);
