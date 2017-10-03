import { StackNavigator } from 'react-navigation';

import mapNavigationStateParamsToProps from '../helpers/mapNavigationStateParamsToProps';
import Home from '../containers/Discover/Home';
import User from '../containers/Shared/User';

const routeConfiguration = {
  Home: { screen: Home },
  DiscoverUser: { screen: mapNavigationStateParamsToProps(User) },
};

const stackNavigatorConfiguration = {
  headerMode: 'none',
  initialRouteName: 'Home'
};

export const NavigatorDiscover = StackNavigator(routeConfiguration, stackNavigatorConfiguration);
