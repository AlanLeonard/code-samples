<template lang="pug">
  Modal(destination='Portfolio')
    FaeImage(:fae-image='company.logo' v-if='company.logo && company.logo.assetUrl').portfolio_detail--logo
    .portfolio_detail--description(v-if='company.description')
      BaseTypoText(variant='3' tag='div') {{ company.description}}
    FaeImage(v-if='company.heroImage && company.heroImage.assetUrl' :fae-image='company.heroImage').portfolio_detail--image
    //- Non-case study
    BaseTypoHeader(variant='2' tag='h1' display-block v-if='company.name').portfolio_detail--header {{ company.name }}
    .portfolio_detail
      .portfolio_detail--left
        .portfolio_detail--intro(v-if='company.name || company.description2')
          BaseTypoParagraph(v-if='company.description2') {{ company.description2 }}
        Headlines(v-if='company.featuredMediaStories && company.featuredMediaStories.length' :headlines='company.featuredMediaStories')
          template(v-slot:title)
            SectionTitle(title='Headlines' modal)
        Headlines(v-else-if='company.mediaStories && company.mediaStories.length' :headlines='company.mediaStories')
          template(v-slot:title)
            SectionTitle(title='Headlines' modal)
        .case_study.u--large_plus(v-if='company.caseStudy')
          .case_study--top
            BaseTypoHeader(variant='3' v-if='company.caseStudyHeadline1').case_study--header {{company.caseStudyHeadline1}}
            BaseTypoParagraph {{company.caseStudyIntroduction}}
      .portfolio_detail--right
        //- .portfolio_detail--item(v-if='company.ceoName')
        //-   BaseTypoSubscript CEO
        //-   BaseTypoParagraph {{company.ceoName}}
        .portfolio_detail--item(v-if='company.investmentYear')
          BaseTypoSubscript Investment Year
          BaseTypoParagraph {{company.investmentYear}}
        .portfolio_detail--item(v-if='company.statusDescription')
          BaseTypoSubscript Status
          BaseTypoParagraph {{company.statusDescription}}
        .portfolio_detail--item(v-if='company.sectors && company.sectors.length >= 1')
          BaseTypoSubscript Sector
          BaseTypoParagraph {{joinedSectors}}

        .portfolio_detail--item(v-if='company.teamMembers && company.teamMembers.length')
          BaseTypoSubscript GHP Team
          div(v-for='member in company.teamMembers' :key='member.id' style='margin-bottom: 15px;')
            BaseLink(:to='`/team/${member.slug}`' )
              | {{member.fullName}}
        .portfolio_detail--item(v-if='company.websiteUrl')
          BaseTypoSubscript Link
          div
            BaseTypoParagraph
              BaseLink(:to='company.websiteUrl') Website
        .case_study.u--large_down(v-if='company.caseStudy')
          .case_study--top
            BaseTypoHeader(variant='3' v-if='company.caseStudyHeadline1').case_study--header {{company.caseStudyHeadline1}}
            BaseTypoParagraph {{company.caseStudyIntroduction}}
    .case_study(v-if='company.caseStudy')
      PortfolioPerson(v-if='company.caseImage1 && company.caseImage1.assetUrl && company.featuredPartnerTitle && company.featuredPartnerTitle' :image='company.caseImage1' :partnerName='company.featuredPartnerName' :partnerTitle='company.featuredPartnerTitle')
      Quote(v-if='company.caseQuote && company.caseAttribution' :quote='company.caseQuote' :attribution='company.caseAttribution')
      CaseStudySection(:headline='company.caseStudyHeadline2' :body='company.caseDescription' :facts='company.caseStudyFastFacts')


</template>

<script>
import SectionTitle from '~/components/SectionTitle'
import Headlines from '~/components/Headlines'
import PortfolioPerson from '~/components/PortfolioPerson'
import Quote from '~/components/Quote'
import CaseStudySection from '~/components/CaseStudySection'
import pageQuery from '~/gql/pages/portfolio/detail'
export default {
  components: {
    SectionTitle,
    Headlines,
    PortfolioPerson,
    Quote,
    CaseStudySection
  },
  head() {
    return this.$setHead({
      title: this.company.derivedSeoTitle,
      description: this.company.derivedSeoDescription,
      ogTitle: this.company.derivedSocialMediaTitle,
      ogDescription: this.company.derivedSocialMediaDescription,
      ogFaeImage: this.company.derivedSocialMediaImage,
      canonical: process.env.baseUrl + '/companies/' + this.company.slug
    })
  },
  async asyncData({ app, error, params }) {
    let gqlQuery = await app.apolloProvider.defaultClient.query({
      query: pageQuery,
      variables: {
        slug: params.slug
      }
    })

    const returnData = gqlQuery.data.company[0]
    if (!returnData) {
      return error({ statusCode: 404 })
    }

    return {
      company: returnData
    }
  },
  computed: {
    joinedSectors() {
      if (this.company.sectors && this.company.sectors.length > 1) {
        return this.company.sectors.map(sector => sector.name).join(', ')
      } else if (this.company.sectors && this.company.sectors.length == 1) {
        return this.company.sectors[0].name
      } else {
        return false
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.portfolio_detail {
  position: relative;
  margin: 0 auto;
  @include media-grid('>=lg', $susy-24) {
    @include v-spacing($size: lg, $type: margin, $pos: bottom);
    display: flex;
    justify-content: space-between;
    width: susy-span(18 of 18);
  }
  @include media-grid('>=wide', $susy-24) {
    width: susy-span(16 wider of 16 wider);
  }
  .portfolio_detail--left {
    width: susy-span(10 of 10);
    margin: 0 auto;
    @include media-grid('>=md', $susy-24) {
      width: susy-span(18 of 18);
    }
    @include media-grid('>=lg', $susy-24) {
      margin: initial;
      width: susy-span(12 of 18);
    }
    @include media-grid('>=wide', $susy-24) {
      width: susy-span(11 of 16);
    }
  }
  .portfolio_detail--right {
    @include v-spacing($size: md, $type: padding, $pos: top);
    @include media-grid('<lg') {
      padding-top: 0;
    }
    width: susy-span(10 of 10);
    margin: 0 auto;
    @include media-grid('>=md', $susy-24) {
      width: susy-span(18 wide of 18 wide);
    }
    @include media-grid('>=lg', $susy-24) {
      margin: initial;
      width: susy-span(6 of 18);
    }
    @include media-grid('>=wide', $susy-24) {
      width: susy-span(4 of 16);
    }
  }
}
.portfolio_detail--image {
  margin-left: calc(-1 * #{susy-span(2 wide of 12)});
  margin-right: calc(-1 * #{susy-span(2 wide of 12)});
  @include media-grid('>=md', $susy-24) {
    margin-left: calc(-1 * #{susy-span(2 of 16 wide)});
    margin-right: calc(-1 * #{susy-span(2 of 16 wide)});
  }
  @include media-grid('>=wide', $susy-24) {
    margin-left: calc(-1 * #{susy-span(2 wide of 16)});
    margin-right: calc(-1 * #{susy-span(1 wide of 16)});
  }
}
.portfolio_detail--logo {
  ::v-deep img {
    max-height: 200px;
    object-fit: contain;
  }
  width: susy-span(8 wider of 12);
  margin: 0 auto;
  @include v-spacing($size: xl, $type: margin, $pos: bottom);
  @include media-grid('>=md', $susy-24) {
    width: susy-span(10 of 20);
  }
  @include media-grid('>=wide', $susy-24) {
    width: susy-span(8 of 16 wider);
  }
}
.portfolio_detail--description {
  @include v-spacing($size: sm, $type: margin, $pos: bottom);
  text-align: center;
  width: susy-span(10 of 12);
  margin-right: auto;
  margin-left: auto;
  @include media-grid('>=md', $susy-24) {
    width: susy-span(14 of 20);
  }
  @include media-grid('>=wide', $susy-24) {
    width: susy-span(16 wider of 16 wider);
  }
}
.portfolio_detail--header {
  @include v-spacing($size: md, $type: margin, $pos: top);
}
.portfolio_detail--intro {
  @include v-spacing($size: md, $type: margin, $pos: top);
  @include v-spacing($size: lg, $type: margin, $pos: bottom);
}
.case_study {
  @include media('<md') {
    margin: 0 auto;
    width: susy-span(10 of 10);
  }
}
.case_study--header {
  @include v-spacing($size: sm, $type: margin, $pos: bottom);
}
.portfolio_detail--item {
  @include v-spacing($size: xs, $type: margin, $pos: bottom);
}
.case_study--top {
  @include media('<lg') {
    @include v-spacing($size: lg, $type: margin, $pos: top);
  }
}
.section_title {
  @include media('<lg') {
    left: 0;
  }
}
.headlines {
  @include v-spacing($size: lg, $type: margin, $pos: top);
  @include media('<lg') {
    @include v-spacing($size: lg, $type: margin, $pos: bottom);
  }
}
</style>