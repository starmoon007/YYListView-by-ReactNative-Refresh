/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Animated,
} from 'react-native';

var Dimensions = require('Dimensions');

var _animateValue = 1;
var _needEndAnimating = false;

export default class YYListViewHeaderView extends Component {

  constructor(props) {
    super(props);

    this.state = {
      topDis: new Animated.Value(0),
      up : false
    };
  };

  componentDidMount() {

  };

  startRefreshing = ()=>{
    if (_needEndAnimating){
      _needEndAnimating = false;
      return;
    }
    _animateValue = -_animateValue;
    this.setState({
      up : (_animateValue < 0)
    })

    Animated.timing(this.state.topDis, {
      toValue: _animateValue,
      duration: 300,
    }).start(() => this.startRefreshing());
  };
  
  endRefreshing = ()=>{
    console.log('endRefreshing');
    _needEndAnimating = true;
    this.state.topDis.stopAnimation();
  };
  
  render() {
    var _imagePath = this.state.up ? require('./loading2.png') : require('./loading1.png');
    return (
      <View style={styles.container}>
        <Animated.Image
            ref = {(topImage) => this.topImage = topImage}
            style={[styles.topImage,{
                top: this.state.topDis.interpolate({
                        inputRange: [0,1],
                        outputRange: [0,8]
                    })
            }]}
            source={_imagePath}>
        </Animated.Image>
        <Animated.Image
            ref = 'bottomImage'
            style={[styles.bottomImage,{
              width : this.state.topDis.interpolate({
                      inputRange: [-1,1],
                      outputRange: [8,20]
              }),
              height: this.state.topDis.interpolate({
                      inputRange: [-1,1],
                      outputRange: [8,10]
              }),
            }]}
            resizeMode = {Image.resizeMode.stretch}
            source={require('./loadingpoint.png')}>
        </Animated.Image>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flexDirection:'column',
    justifyContent : 'center',
    alignItems : 'center'
  },
  topImage : {
    flex:3,
    width: 30,
    height: 30
  },
  bottomImage : {
    flex:1,
    width: 8,
    height: 8,
    marginTop : 8
  }
});



