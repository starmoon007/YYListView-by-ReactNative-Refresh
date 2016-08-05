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
  ListView,
} from 'react-native';

import YYListViewHeaderView from './YYListViewHeaderView';
import YYListViewFooterView from './YYListViewFooterView';

var
    YYRefreshHeaderStateIdle                = 0,    // 头部视图普通闲置状态
    YYRefreshHeaderStatePullingNotriggered  = 1,     // 头部视图下拉中未触发刷新的状态
    YYRefreshHeaderStatePullingTriggered    = 2,    // 头部视图松开就可以进行刷新的状态
    YYRefreshHeaderStateRefreshing          = 3,    // 头部视图正在刷新中的状态
    YYRefreshHeaderStateEndRefresh          = 4,    // 头部视图即将刷新的状态

    YYRefreshFooterStateIdle                = 6,    // 底部视图普通闲置状态
    YYRefreshFooterStateRefreshing          = 7,    // 底部视图正在刷新中的状态
    YYRefreshFooterStatePullingTriggered    = 8,    // 底部视图松开就可以进行刷新的状态
    YYRefreshFooterStateNoMoreData          = 9 ;    // 底部视图所有数据加载完毕，没有更多的数据了

var YYRefreshListViewKey  = 'YYRefreshListViewKey', // listView key
    YYRefreshHeaderKey    = 'YYRefreshHeaderKey',   // 头部视图ref key
    YYRefreshFootKey      = 'YYRefreshFootKey';     // 底部视图ref key

var Dimensions = require('Dimensions');

var headerViewStatus = YYRefreshHeaderStateIdle,// 头部视图当前状态
    footerViewStatus = YYRefreshFooterStateIdle;// 底部视图当前状态


var offSetY = 0,// listView Y轴滚动距离
    listViewContentHeight = 0; // listView 的contentHeight

var screenWidth = Dimensions.get('window').width,// 屏幕宽
    listViewHeight = 0;// listView高度

var listViewContentInsetTop = 0,// listView 顶部偏移
    listViewContentInsetBottom = 0;// listView 底部偏移

var noData = true;

export default class YYListView extends Component {

  constructor(props) {
    super(props);

    // this.state = {
    //   status: YYRefreshHeaderStateIdle,
    // };
  };

  // 主动调用下拉刷新
  startHeaderViewRefreshing = ()=>{
    //头部视图进入刷新状态
    headerViewStatus = YYRefreshHeaderStateRefreshing;
    this.adjustmentListViewContentInset();
    this.headerView.startRefreshing ();
    this._loadNewData();
    this.headerTimer && clearTimeout(this.headerTimer);
    this.headerTimer = setTimeout(()=>{
      this.endRefreshHeaderView();
    },this.props.timeOut * 1000);
    this.listView && this.listView.scrollTo({x: 0, y: 0, animated: true});
  };

  // 结束头部刷新
  endRefreshHeaderView = ()=>{
    if (headerViewStatus != YYRefreshHeaderStateIdle){
      this.headerTimer && clearTimeout(this.headerTimer);
      headerViewStatus = YYRefreshHeaderStateIdle;
      this.adjustmentListViewContentInset();
      this.headerView.endRefreshing();
      console.log('endRefreshHeaderView');
    }
  };

  // 结束底部刷新
  endRefreshFooterView = ()=>{
    if (footerViewStatus != YYRefreshFooterStateIdle){
      this.footerTimer && clearTimeout(this.footerTimer);
      footerViewStatus = YYRefreshFooterStateIdle;
      this.adjustmentListViewContentInset();
      this.footerView.endRefreshing();
      console.log('endRefreshFooterView');
    }
  };

  componentDidMount() {

  };

  shouldComponentUpdate (){
    this.canLoadMoreData(this.props.footerViewAble)
    return true;
  };

  componentDidUpdate (){
    this.adjustmentListViewContentInset();
    console.log('componentDidUpdate');
  };

  componentWillUnmount() {
    this.headerTimer && clearTimeout(this.headerTimer);
    this.footerTimer && clearTimeout(this.footerTimer);
  };

  // 设置能否直接加载更多  able==false时, footerView的状态为 没有更多数据
  canLoadMoreData = (able)=>{
    this.footerView && this.footerView.ableLoadMoreData(able);
    if (able){
      footerViewStatus = YYRefreshFooterStateIdle;
    }else {
      footerViewStatus = YYRefreshFooterStateNoMoreData;
    }
  };

  // 调整listView的 contentInset
  adjustmentListViewContentInset = ()=>{
    if(noData)return;
    // 只有当头部视图在刷新中 才需要将ContentInsetTop = -this.props.headerViewHeight
    listViewContentInsetTop = ((headerViewStatus == YYRefreshHeaderStateRefreshing) || this.props.hiddenHeaderView) ? 0 : -this.props.headerViewHeight;
    // 只有当底部视图在刷新中,才需要将ContentInsetBottom = - this.props.footerViewHeight
    listViewContentInsetBottom = ((footerViewStatus == YYRefreshFooterStateRefreshing) || this.props.hiddenFooterView) ? 0 : - this.props.footerViewHeight;
    this.listView && this.listView.setNativeProps({
      contentInset :{top:listViewContentInsetTop,left: 0, bottom: listViewContentInsetBottom, right: 0}
    });
    // 调整头部视图
    if(offSetY <= -listViewContentInsetTop){
      this.listView && this.listView.scrollTo({x: 0, y: -listViewContentInsetTop, animated: true});
      return;
    }
    // 调整底部视图
    // if (listViewHeight == 0 )return;// listView刚刚渲染到屏幕上
    // if (footerViewStatus == YYRefreshFooterStateRefreshing)return;// 正在加载更多,不需要调整listView的滚动距离
    // // console.log(offSetY,listViewContentHeight,this.props.footerViewHeight,listViewHeight);
    // if (offSetY >= listViewContentHeight - this.props.footerViewHeight - listViewHeight - this.props.headerViewHeight){
    //   // this.listView.scrollTo({x: 0, y: listViewContentHeight - this.props.footerViewHeight - listViewHeight, animated: true});
    // }
  }
  // 下拉刷新
  _loadNewData = () =>{
    this.props.loadNewData();
  };
  // 上拉加载更多
  _loadMoreData= () =>{
    this.props.loadMoreData();
  };

  // listView滚动回调
  scrollHandler = (e)=> {
      offSetY = e.nativeEvent.contentInset.top + e.nativeEvent.contentOffset.y
       // 下拉刷新
      if(!this.props.hiddenHeaderView && headerViewStatus != YYRefreshHeaderStateRefreshing){
        if(offSetY < 0 && offSetY > -this.props.pullDistance ){
          //头部视图下拉中未触发刷新的状态
          if (headerViewStatus != YYRefreshHeaderStatePullingNotriggered){
            headerViewStatus = YYRefreshHeaderStatePullingNotriggered;
          }
        }else if(offSetY <= -this.props.pullDistance ){
          // 头部视图松开就可以进行刷新的状态
          if (headerViewStatus != YYRefreshHeaderStatePullingTriggered){
            headerViewStatus = YYRefreshHeaderStatePullingTriggered;
          }
        }
        else{
          if (headerViewStatus != YYRefreshHeaderStateIdle){
            headerViewStatus = YYRefreshHeaderStateIdle;
          }
        }
      }

      // 上拉加载更多
      if (!this.props.hiddenFooterView){
        listViewContentHeight = e.nativeEvent.contentSize.height;
        listViewContentHeight = listViewContentHeight < listViewHeight ? listViewHeight : listViewContentHeight;
        if(footerViewStatus == YYRefreshFooterStateIdle){
          if(listViewHeight + offSetY > listViewContentHeight){
            footerViewStatus = YYRefreshFooterStatePullingTriggered;
            console.log(7666);
          }
        }
      }

      this.props.onScroll && this.props.onScroll(e);
  };

  // 手指松开
  handleResponderRelease = (e) => {
    if(!this.props.hiddenHeaderView && headerViewStatus == YYRefreshHeaderStatePullingTriggered){
      //头部视图进入刷新状态
      headerViewStatus = YYRefreshHeaderStateRefreshing;
      this.adjustmentListViewContentInset();
      this.headerView.startRefreshing ();
      this._loadNewData();
      this.headerTimer && clearTimeout(this.headerTimer);
      this.headerTimer = setTimeout(()=>{
        this.endRefreshHeaderView();
      },this.props.timeOut * 1000);
    }

    if (!this.props.hiddenFooterView && footerViewStatus == YYRefreshFooterStatePullingTriggered){
      // 底部视图进入刷新状态
      footerViewStatus = YYRefreshFooterStateRefreshing;
      this.adjustmentListViewContentInset();
      this.footerView.startRefreshing ();
      this._loadMoreData();
      this.footerTimer && clearTimeout(this.footerTimer);
      this.footerTimer = setTimeout(()=>{
         this.endRefreshFooterView();
      },this.props.timeOut * 1000);
    }
  };

  _onLayout = (layoutData)=>{
    listViewHeight = layoutData.nativeEvent.layout.height;
  }

  renderHeader = ()=>{
    if (this.props.hiddenHeaderView){
      return(
          <View></View>
      );
    }
    return (
        <View style={[styles.header,{height:this.props.headerViewHeight}]}>
          <YYListViewHeaderView ref = {(headerView) =>this.headerView = headerView }></YYListViewHeaderView>
        </View>
    );
  }

  renderFooter = ()=> {
    if (this.props.hiddenFooterView){
      return(
          <View></View>
      );
    }
    return (
        <View style={[styles.foot,{height:this.props.footerViewHeight}]}>
          <YYListViewFooterView ref = {(footerView) =>this.footerView = footerView }></YYListViewFooterView>
        </View>
    );
  }

  render() {
    var dataSource = this.props.dataSource;
    if(dataSource.sectionIdentities && dataSource.rowIdentities &&dataSource.sectionIdentities.length ==0 && dataSource.rowIdentities.length == 0){
  	  noData = true;
      return (
          <View
              style = {styles.noData}>
              {this.props.noDataView()}
           </View>
      );
    }
    if(noData){
      // 之前没有真的加载ListView
      offSetY = this.props.hiddenHeaderView ? 0 : this.props.headerViewHeight;
    }
    noData = false;
    return (
       <ListView
           ref = {(listView) => this.listView = listView}
           {...this.props}
        	automaticallyAdjustContentInsets={false}
            onScroll={(e)=>this.scrollHandler(e)}
            renderHeader={() => this.renderHeader()}
            renderFooter={() => this.renderFooter()}
            onResponderRelease={(e) => this.handleResponderRelease(e)}
            onLayout={(layoutData)=>this._onLayout(layoutData)}
        />
    );
  }
};

const styles = StyleSheet.create({
  header:{
    justifyContent : 'center',
    alignItems : 'center'
  },
  foot: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noData :{
    flex : 1,
    justifyContent : 'center',
    alignItems : 'center',
    height:Dimensions.get('window').height
  }
});

YYListView.propTypes = {
  headerViewHeight : React.PropTypes.number,
  footerViewHeight : React.PropTypes.number,
  pullDistance : React.PropTypes.number,
  timeOut : React.PropTypes.number,
  hiddenHeaderView : React.PropTypes.bool,
  hiddenFooterView : React.PropTypes.bool,
  footerViewAble : React.PropTypes.bool,
  loadNewData : React.PropTypes.func,
  loadMoreData : React.PropTypes.func,
  noDataView: React.PropTypes.func
};

YYListView.defaultProps={
  headerViewHeight : 60,
  footerViewHeight : 40,
  pullDistance : 90,
  timeOut :2,
  hiddenHeaderView : false,
  hiddenFooterView : false,
  footerViewAble : true,
  loadNewData : () => {
    return false;
  },
  loadMoreData : () =>{
    return false;
  },
  noDataView : ()=>{
    return (
        <Text>
            NODATA----test
        </Text>
    );
  }
};

