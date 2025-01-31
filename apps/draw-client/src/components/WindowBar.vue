<template>
    <div class="v-window-bar">
        <div class="g-m-t-4 g-m-l-4 g-ai-c">
            <img style="width: 20px;height: 20px;" src="/statics/header/design.svg" />
            <span class="_bar-title"> HfDraw </span>
        </div>
        <span class="_text _rls g-one-line">
            未命名项目1
        </span>
    </div>
</template>
<script lang="ts" setup>

</script>
<style lang="scss">
@use '@/assets/css/theme.scss' as *;

.v-window-bar {
    width: 100%;
    background: $frame-title-bg-color;
    // -webkit-app-region: drag; 是一个非常有用的 CSS 属性，
    // 尤其在开发无边框的 Electron 应用时。它允许你自定义窗口的拖动区域，提供更灵活的 UI 设计。
    -webkit-app-region: drag;
    display: flex;
    position: relative;
    height: 28px;
    overflow: hidden;
    ._text {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }
    ._rls {
        color: white;
        align-self: center;
    }

    ._bar-title {
        margin-left: 4px;
        font-size: 13px;
        color: white;
        font-weight: bold;
    }

    ._window-right-btns {
        width: 102px;
        height: 28px;
        margin-right: 0px;
        display: flex;

        ._window-btn {
            cursor: pointer;
            text-align: center;
            padding-top: 5px;
            -webkit-app-region: no-drag;
            height: 28px;

            &._min-btn {
                width: 40px;

                // background-image: url("/statics/images/mainpage/iconleftbg1.svg");
                &:hover {
                    background-color: #1f8aca;
                    // background-image: url("/statics/images/mainpage/iconleftbg2.svg");
                }

                &:active {
                    background-color: #1f8aca;
                    // background-image: url("/statics/images/mainpage/iconleftbg3.svg");
                }
            }

            &._max-btn {
                width: 40px;

                // background-image: url("/statics/images/mainpage/iconmbg1.svg");
                &:hover {
                    // background-image: url("/statics/images/mainpage/iconmbg2.svg");
                    background-color: #1f8aca;
                }

                &:active {
                    background-color: #1f8aca;
                }
            }

            &._close-btn {
                width: 40px;

                &:hover {
                    background-color: #c72122;
                }

                &:active {
                    background-color: #981516;
                }

            }
        }
    }
}
</style>