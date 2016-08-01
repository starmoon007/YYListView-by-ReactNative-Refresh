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
  ActivityIndicator
} from 'react-native';

var Dimensions = require('Dimensions');
// 上拉加载更多
// 正在加载更多数据...
// 加载完成
// 没有更多数据
var footerViewStateIdle = 1,
    footerViewStateLoading = 2,
    footerViewStateLoaded = 3,
    footerViewStateNoMoreData = 4;

export default class YYListViewFooterView extends Component {

  constructor(props) {
    super(props);

    this.state = {
      status : footerViewStateIdle
    };
  };

  componentDidMount() {

  };

  startRefreshing = ()=>{
    this.setState({
      status : footerViewStateLoading
    });
  };
  
  endRefreshing = ()=>{
    this.setState({
      status : footerViewStateLoaded
    });
    this.timer && clearTimeout(this.timer);
    this.timer = setTimeout(()=>{
      if (this.state.status != footerViewStateNoMoreData){
        this.setState({
          status : footerViewStateIdle
        });
      }
    }, 1000);
  };

  ableLoadMoreData = (able)=>{
    if (able){
      this.setState({
        status : footerViewStateIdle
      });
    }else {
      this.setState({
        status : footerViewStateNoMoreData
      });
    }
  }


  render() {
    var status = this.state.status;
    if (status == footerViewStateLoading){
      return (
          <View style={styles.container}>
            <ActivityIndicator/>
            <Text style={styles.text}>正在加载更多...</Text>
          </View>
      );
    }else if(status == footerViewStateLoaded){
      return (
          <View style={styles.container}>
            <Text style={styles.text}>加载完成</Text>
          </View>
      );
    }else if (status == footerViewStateNoMoreData){
      return (
          <View style={styles.container}>
            <Text style={styles.text}>没有更多数据</Text>
          </View>
      );
    }

    return (
      <View style={styles.container}>
        <Text style={styles.text}>上拉加载更多</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flexDirection:'row',
    justifyContent : 'center',
    alignItems : 'center',
  },
  text :{
    marginLeft : 10
  }
});



