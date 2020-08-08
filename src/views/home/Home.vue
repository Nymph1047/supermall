<template>
    <div id="home">
        <nav-bar class="home-nav">
            <div slot="center">购物街</div>
        </nav-bar>
        <tab-control  :titles="['流行','新款','精选']"
                      @tabClick="tabClick"
                      ref="tabControl1"
                      class="tab-control"
                      v-show="isTabFixed"
        ></tab-control>
        <scroll class="content"
                ref="scroll"
                :probe-type="3"
                @scroll="contentScroll"
                :pull-up-load="true"
                @pullingUp="loadMore"
        >
            <home-swiper :banners="banners" ref="swiper" @swiperImageLoad="swiperImageLoad" />
            <recommend-view :recommends="recommends"/>
            <feature-view></feature-view>
             <tab-control  :titles="['流行','新款','精选']"
                           @tabClick="tabClick"
                           ref="tabControl2"
                           :class="{fixed: isTabFixed}"
              ></tab-control>
              <goods-list :goods="showGoods"></goods-list>
        </scroll>
        <back-top @click.native="backClick" v-show="isShowBackTop"></back-top>
    </div>
</template>

<script>
    import HomeSwiper from "./childComps/HomeSwiper";
    import RecommendView from "./childComps/RecommendView";
    import FeatureView from "./childComps/FeatureView";

    import NavBar from "../../components/common/navbar/NavBar";
    import TabControl from "../../components/content/tabControl/tabControl";
    import GoodsList from "../../components/content/goods/GoodsList";
    import Scroll from "../../components/common/scroll/Scroll";
    import BackTop from "../../components/content/backtop/BackTop";

    import { getHomeMultidata,getHomeGoods} from "../../network/home";
    import {debounce} from "../../common/utils";
    import {itemListenerMixin} from "../../common/mixin";


    export default {
        name:"Home",
        components: {
            BackTop,
            Scroll,
            GoodsList,
            TabControl,
            FeatureView,
            NavBar,
            HomeSwiper,
            RecommendView,
        },
        data () {
            return {
                banners: [],
                recommends:[],
                goods:{
                    'pop': {page: 0, list:[]},
                    'new': {page: 0, list:[]},
                    'sell': {page: 0, list:[]},
                },
                currentType: 'pop',
                isShowBackTop: false,
                tabOffsetTop: 0,
                isTabFixed: false,
                saveY: 0
            }
        },
        mixins:[itemListenerMixin],
        created() {
            // 1.请求多个数据
            this.getHomeMultidata()
            // 请求商品数据
            this.getHomeGoods('pop')
            this.getHomeGoods('new')
            this.getHomeGoods('sell')

            // 复制
            this.tabOffsetTop = this.$refs.tabControl
        },
        computed: {
            showGoods() {
                return this.goods[this.currentType].list
            }
        },
        destroyed() {
            console.log('home destroyed')
        },
        activated() {
            this.$refs.scroll.scrollTo(0, this.saveY, 0)
            // 刷新
            this.$refs.scroll.refresh()
        },
        deactivated() {
            // 保存Y值
            this.saveY = this.$refs.scroll.getScrollY()

            // 取消全局事件的监听
            this.$bus.$off('itemImgLoad', this.itemImgListener)
        },
        mounted() {
            // this.$refs.swiper
                // 监听item中图片加载完成
          // const refresh = debounce(this.$refs.scroll.refresh, 50)
          //   this.$bus.$on('itemImageLoad',() => {
          //       refresh()
          //   })
          //   let newRefresh = debounce(this.$refs.scroll.refresh, 100)
          //
          //   this.itemImgListener = () => {
          //       newRefresh()
          //   }
          //   this.$bus.$on('itemImgLoad', this.itemImgListener)
            // 获取tabControl的offsetTop
            // this.tabOffsetTop = this.$refs.tabControl

                },
        methods: {
            // 事件监听点击办法
            tabClick(index){
              switch (index) {
                  case 0:
                      this.currentType = 'pop'
                      break
                  case 1:
                      this.currentType = 'new'
                      break
                  case 2:
                      this.currentType = 'sell'
                      break
              }
              this.$refs.tabControl1.currentIndex = index;
              this.$refs.tabControl2.currentIndex = index;
            },
            // 网络请求相关的办法
            getHomeMultidata() {
                getHomeMultidata().then(res => {
                    this.banners = res.data.banner.list;
                    this.recommends = res.data.recommend.list;
                })
            },
            getHomeGoods(type) {
                const page = this.goods[type].page +1
                getHomeGoods(type,page).then(res =>{
                    this.goods[type].list.push(...res.data.list)
                    this.goods[type].page += 1
                    // 完成上拉加载更多
                    this.$refs.scroll.finishPullUp()
                })
            },
            backClick() {
                this.$refs.scroll.scroll.scrollTo(0,0)
            },
            contentScroll(position) {
                // 判断BackTop是否显示
                this.isShowBackTop = -(position.y) > 1000
                // 决定tabControl是否吸顶
                this.isTabFixed = (-position.y) > this.tabOffsetTop
            },
            loadMore() {
                this.getHomeGoods(this.currentType)
            },
            swiperImageLoad() {
                this.tabOffsetTop = this.$refs.tabControl2.$el.offsetTop
            }
        },
    }
</script>

<style scoped>
    #home{
       padding-top: 44px;
    }
    .home-nav{
        background: var(--color-tint);
        color: #fff;

        position: fixed;
        left: 0;
        right: 0;
        top: 0;
        z-index: 9;
    }
    .content{
         height: calc(100vh - 93px)
    }
    .tab-control{
        position: relative;
        z-index: 1;
    }
</style>
