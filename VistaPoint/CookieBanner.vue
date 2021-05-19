<template lang="pug">
transition(name='cookie-banner')
  .cookie_banner--root
    BaseContainer
      .cookie_banner--inner Our site uses cookies – some are essential to make the site work; others help us improve the user experience. By using the site, you consent to the use of these cookies. To learn more about cookies and how you can disable them, please read our #[BaseLink(@click.native='handleClose' :to='{ name: "privacy" }' big-underline big-underline-cream) Privacy Policy].
      BaseButton(@click.native='handleClose').cookie_banner--button
        template
          | Accept
</template>

<script>
/**
 * @note Styles can be updated freely per project, but changes to functionality should be
 *       cleared against and/or folded into the business intent in the doc linked above
 */
export default {
  methods: {
    handleClose() {
      // Close the cookie banner and set a cookie for future requests
      this.$cookies.set('cookie_banner_accepted', true, {
        maxAge: 60 * 60 * 24 * 30 // = 2,592,000 seconds (Hide the notification banner for 30 days)
      })
      this.$store.commit('setIsCookieBannerAccepted', true)
    }
  }
}
</script>

<style lang="scss" scoped>
.cookie_banner--root {
  width: 100%;
  background: $c-mint;
  color: $c-black;
  @include media-grid('<md') {
    padding: 24px 0 0;
  }
  padding: 24px 0;
  position: fixed;
  bottom: 0;
  z-index: zi('cookie_banner');
  opacity: 0;
  animation: bannerLoad 0.8s;
  animation-delay: 1s;
  animation-fill-mode: forwards;
}

.cookie_banner--button {
  text-align: center;
  color: $c-white;
  background-color: $c-jade !important;
  color: $c-white !important;
  border: none !important;
  white-space: nowrap;
  &:hover,
  &:focus {
    background-color: $c-emerald !important;
  }
  @include media-grid('<md') {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
  }
}
::v-deep .container {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  @include media-grid('<md') {
    flex-direction: column;
  }
}
.cookie_banner--inner {
  @include t-paragraph-1;
  @include media-grid('<md') {
    padding-bottom: 75px;
  }
  @include media-grid('>=md') {
    @include susy-use($susy-tablet) {
      width: susy-span(13 of 18);
    }
  }
  @include media-grid('>=lg') {
    @include susy-use($susy-desktop) {
      width: susy-span(14 of 18);
    }
  }
}
::v-deep .base_button {
  @include media-grid('<md') {
    width: 100%;
    margin-left: 0;
  }
}

@keyframes bannerLoad {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0px);
  }
}

.cookie-banner-leave-active {
  transition: all 0.8s ease;
  animation: none;
}

.cookie-banner-leave {
  opacity: 1;
}

.cookie-banner-leave-to {
  opacity: 0;
}
</style>
