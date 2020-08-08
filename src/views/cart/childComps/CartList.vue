<template>
    <div class="cart-list">
        <scroll class="content" ref="scroll">
            <car-list-item v-for="(item,index) in cartList"
                           :key="index"
                           :item-info="item"></car-list-item>
        </scroll>
    </div>
</template>

<script>
    import Scroll from "../../../components/common/scroll/Scroll";

    import CarListItem from "./CarListItem";

    import { mapGetters } from 'vuex'

    export default {
        name: "CartList",
        components:{
            Scroll,
            CarListItem
        },
        computed:{
            ...mapGetters(['cartList'])
        },
        activated() {
            this.$refs.scroll.refresh()
        }
    }
</script>

<style scoped>
    .cart-list {
        height: calc(100% - 44px - 49px - 40px);
    }
    .content{
        height: 100%;
        overflow: hidden;
    }
</style>
