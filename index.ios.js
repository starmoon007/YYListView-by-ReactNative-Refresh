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
  ListView
} from 'react-native';

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

  componentDidMount() {
    this._loadNewData();
    // setTimeout(()=>{
    //   this.listView.startHeaderViewRefreshing();
    // },5000);
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
