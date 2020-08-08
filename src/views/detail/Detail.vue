<template>
    <div id="detail" name="Detail">
        <detail-nav-bar class="detail-nav" @titleClick="titleClick" ref="nav"></detail-nav-bar>
        <scroll class="content" ref="scroll"
                :probe-type="3"
                @scroll="commentScroll">
        <detail-swiper :top-images="topImages"></detail-swiper>
        <detail-base-info :goods="goods"></detail-base-info>
        <detail-shop-info :shop="shop"></detail-shop-info>
         <detail-goods-info :detail-info="detailInfo" @imageLoad="imageLoad"></detail-goods-info>
            <detail-param-info ref="params" :param-info="paramInfo"></detail-param-info>
            <detail-comment-info ref="comment" :comment-info="commentInfo"></detail-comment-info>
            <goods-list ref="recommend" :goods="recommends"></goods-list>

        </scroll>
        <detail-bottom-bar @addCart="addToCart" ></detail-bottom-bar>
        <back-top @click.native="backClick" v-show="isShowBackTop"></back-top>
        <toast :message="message" :show="show"></toast>
    </div>
</template>

<script>
    import DetailNavBar from "./childComps/DetailNavBar";
    import DetailSwiper from "./childComps/DetailSwiper";
    import DetailBaseInfo from "./childComps/DetailBaseInfo";
    import DetailShopInfo from "./childComps/DetailShopInfo";
    import DetailGoodsInfo from "./childComps/DetailGoodsInfo";
    import DetailParamInfo from "./childComps/DetailParamInfo";
    import DetailCommentInfo from "./childComps/DetailCommentInfo";
    import DetailBottomBar from "./childComps/DetailBottomBar";

    import Scroll from "../../components/common/scroll/Scroll";
    import GoodsList from "../../components/content/goods/GoodsList";
    import BackTop from "../../components/content/backtop/BackTop";
    import Toast from "../../components/common/toast/Toast";

    import {getDetail, Goods, Shop, GoodsParam, getRecommend} from "../../network/detail";
    import {debounce} from "../../common/utils";
    import {itemListenerMixin} from "../../common/mixin";

    import { mapActions } from 'vuex'

    export default {
        name: "Detail",
        components:{
            DetailNavBar,
            DetailSwiper,
            DetailBaseInfo,
            DetailShopInfo,
            Scroll,
            DetailGoodsInfo,
            DetailParamInfo,
            DetailCommentInfo,
            GoodsList,
            DetailBottomBar,
            BackTop,
            Toast
        },
        mixins:[itemListenerMixin],
        data() {
            return {
                iid: null,
                topImages: [],
                goods: {},
                shop: {},
                detailInfo: {},
                paramInfo: {},
                commentInfo: {},
                recommends: [],
                themeTopYs:[],
                getThemeTopY: null,
                currentIndex: 0,
                isShowBackTop: false,
                message:'',
                show:false
            }
        },
        created() {
            // 保存传入的iid
            this.iid = this.$route.params.iid
            // 根据iid请求详情数据
            getDetail(this.iid).then(res =>{
                const data = res.result;
                // 获取顶部的图片轮播数据
                console.log(res)
                this.topImages = res.result.itemInfo.topImages

                // 获取商品信息
                this.goods = new Goods(data.itemInfo,data.columns,data.shopInfo.services)

                // 创建店铺信息
                this.shop = new Shop(data.shopInfo)

                // 保存商品的详情数据
                this.detailInfo = data.detailInfo

                // 获取参数的传递
                this.paramInfo = new GoodsParam(data.itemParams.info, data.itemParams.rule)

                // 取出评论信息
                if (data.rate.cRate !== 0) {
                    this.commentInfo = data.rate.list[0]
                }
                this.$nextTick(() => {
                    // this.themeTopYs = []
                    //
                    // this.themeTopYs.push(0);
                    // this.themeTopYs.push(this.$refs.params.$el.offsetTop);
                    // this.themeTopYs.push(this.$refs.comment.$el.offsetTop);
                    // this.themeTopYs.push(this.$refs.recommend.$el.offsetTop);
                    // console.log(this.themeTopYs)
                })
            })
            // 请求推荐数据
            getRecommend().then(res => {
                this.recommends = res.data.list
            })
            // 给getThemeTopY赋值
            this.getThemeTopY = debounce(() => {
                this.themeTopYs = []

                this.themeTopYs.push(0);
                this.themeTopYs.push(this.$refs.params.$el.offsetTop -44);
                this.themeTopYs.push(this.$refs.comment.$el.offsetTop -44);
                this.themeTopYs.push(this.$refs.recommend.$el.offsetTop -44);
                console.log(this.themeTopYs)
            })
        },
        methods:{
            ...mapActions(['addCart']),
            imageLoad() {
                this.$refs.scroll.refresh()
                this.getThemeTopY()
            },
            titleClick(index) {
                this.$refs.scroll.scrollTo(0,-this.themeTopYs[index],200)
            },
            backClick() {
                this.$refs.scroll.scroll.scrollTo(0,0)
            },
            commentScroll(position) {
                // 获取y值
                const positionY = -position.y
                // positionY和主题中值进行对比
                let length = this.themeTopYs.length
                for (let i = 0; i<length; i++) {
                    if (this.currentIndex !== i && ((i < length -1 && positionY > this.themeTopYs[i] && positionY < this.themeTopYs[i+1])
                        ||
                        (i === length - 1 && positionY > this.themeTopYs[i]))){
                        this.currentIndex = i;
                        console.log(this.currentIndex);
                        this.$refs.nav.currentIndex = this.currentIndex

                        this.isShowBackTop = -(position.y) > 1000
                    }
                }
            },
            addToCart(){
                // 获取购物车需要展示的信息
                const product = {}
                product.image = this.topImages[0];
                product.title = this.goods.title;
                product.desc = this.goods.desc;
                product.price = this.goods.realPrice;
                product.iid = this.iid;
                // 将商品添加到购物车里
                // this.$store.commit('addCart',product)
                // this.$store.dispatch('addCart', product).then(res =>{
                //     this.show = true;
                //     this.message = res;
                //
                //     setTimeout(() => {
                //         this.show = false;
                //         this.message = ''
                //     },1500)
                // })
                this.addCart(product).then(res => {
                    this.$toast.show(res,2000)
                    console.log(this.$toast)
                })
            }
        },
        mounted() {

        },
        destroyed() {
            this.$bus.$off('itemImgLoad', this.itemImgListener)
        },
        updated() {

        }
    }
</script>

<style scoped>
    #detail {
        position: relative;
        z-index: 12;
        background-color: #fff;
        height: 100vh;
    }

    .detail-nav{
        position: relative;
        z-index: 9;
        background: #fff;
    }
    .content {
        height: calc(100vh - 44px - 55px);
    }
</style>
