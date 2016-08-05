/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ListView,
  Alert,
  Platform,
} from 'react-native';

import {
    isFirstTime,
    isRolledBack,
    packageVersion,
    currentVersion,
    checkUpdate,
    downloadUpdate,
    switchVersion,
    switchVersionLater,
    markSuccess,
} from 'react-native-update';

import _updateConfig from './update.json';
const {appKey} = _updateConfig[Platform.OS];

import YYListView from './YYListView/YYListView';
var Dimensions = require('Dimensions');

var dataSource = [];

class YYListViewDemo extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      })
    };
  };

  componentWillMount() {
    if (isFirstTime) {
      Alert.alert('提示', '这是当前版本第一次启动,是否要模拟启动失败?失败将回滚到上一版本', [
        {text: '是', onPress: ()=>{throw new Error('模拟启动失败,请重启应用')}},
        {text: '否', onPress: ()=>{markSuccess()}},
      ]);
    } else if (isRolledBack) {
      Alert.alert('提示', '刚刚更新失败了,版本被回滚.');
    }
  }

  componentDidMount() {

    this._loadNewData();
    // setTimeout(()=>{
    //   this.listView.startHeaderViewRefreshing();
    // },5000);
    this.checkUpdate();
  };

  doUpdate = info => {
    downloadUpdate(info).then(hash => {
      Alert.alert('提示', '下载完毕,是否重启应用?', [
        {text: '是', onPress: ()=>{switchVersion(hash);}},
        {text: '否',},
        {text: '下次启动时', onPress: ()=>{switchVersionLater(hash);}},
      ]);
    }).catch(err => {
      Alert.alert('提示', '更新失败.');
    });
  };
  checkUpdate = () => {
    checkUpdate(appKey).then(info => {
      if (info.expired) {
        Alert.alert('提示', '您的应用版本已更新,请前往应用商店下载新的版本', [
          {text: '确定', onPress: ()=>{info.downloadUrl && Linking.openURL(info.downloadUrl)}},
        ]);
      } else if (info.upToDate) {
        Alert.alert('提示', '您的应用版本已是最新.');
      } else {
        Alert.alert('提示', '检查到新的版本'+info.name+',是否下载?\n'+ info.description, [
          {text: '是', onPress: ()=>{this.doUpdate(info)}},
          {text: '否',},
        ]);
      }
    }).catch(err => {
      Alert.alert('提示', '更新失败.');
    });
  };

  _loadNewData = ()=>{
    setTimeout(()=>{
      dataSource = [];
      for (var i=0; i<10; i++){
        dataSource.push('1');
      }
      this.setState({
        dataSource:this.state.dataSource.cloneWithRows(dataSource),
      });
      this.listView.endRefreshHeaderView();
    },2000)
    
    
    
  };

  _loadMoreData = ()=>{
    setTimeout(()=>{
      for (var i=0; i<10; i++){
        dataSource.push('2');
      }
      this.setState({
        dataSource : this.state.dataSource.cloneWithRows(dataSource),
      });
      this.listView.endRefreshFooterView();
    },2000)
  };



  _renderRow = (data,sectionID, rowID)=>{
    return (
        <View>
          <Text style={{marginLeft:15,height: 44}}>
            第{rowID}行数据
          </Text>
        </View>
    );
  };


  render() {
    return (
        <View>
          <YYListView
              ref={(listView) => this.listView = listView }
              style={styles.listView}
              dataSource={this.state.dataSource}
              renderRow={this._renderRow}
              onScroll={this.scrollHandler}
              loadNewData={() => this._loadNewData()}
              loadMoreData={() => this._loadMoreData()}
          />

        </View>
    );
  };
}

const styles = StyleSheet.create({
  listView:{
    backgroundColor:'#fefefe',
    height:Dimensions.get('window').height
  },
});

AppRegistry.registerComponent('YYListView', () => YYListViewDemo);
