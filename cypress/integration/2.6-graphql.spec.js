import { loginViaCookies, updateRetry } from '../support/common/support.js'
import {
  graphql,
  getShopperIdQuery,
  ValidateShopperIdResponse,
  getReview,
  getReviews,
  totalReviewsByProductId,
  reviewsByProductId,
  validateGetReviewsResponse,
  validateReviewsByProductResponse,
  validateTotalReviewsByProductResponse,
  getreviewByDateRangeQuery,
  ValidateGetreviewByDateRangeQueryResponse,
  gethasShopperReviewedQuery,
  ValidateHasShopperReviewedResponse,
  addReviewQuery,
  getAverageRatingByProductId,
  editReview,
} from '../support/graphql_queries.js'
import {
  testCase6,
  testCase1,
} from '../support/review_and_ratings.outputvalidation.js'
import { approveReviews } from '../support/graphql_testcase.js'

const { anonymousUser1, anonymousUser2 } = testCase6
const { productId, title } = anonymousUser1
const reviewDateTimeEnv = 'reviewDateTimeEnv'

describe('Graphql queries', () => {
  loginViaCookies({ storeFrontCookie: false })

  it('Verify adding review for product', updateRetry(2), () => {
    graphql(addReviewQuery(anonymousUser1), response => {
      expect(response.body).to.not.have.own.property('errors')
      expect(response.body.data.newReview).to.not.equal(null)
      expect(response.body.data.newReview.id).to.contain('-')
      cy.setReviewItem(title, response.body.data.newReview.id)
    })
  })

  approveReviews(title)

  it('Verify reviews by shopperId query', updateRetry(2), () => {
    graphql(getShopperIdQuery(), ValidateShopperIdResponse)
  })

  it('Verify total reviews of product by id query', updateRetry(2), () => {
    graphql(
      totalReviewsByProductId(productId),
      validateTotalReviewsByProductResponse
    )
  })

  it('Verify reviews of product by id query', updateRetry(2), () => {
    graphql(reviewsByProductId(productId), validateReviewsByProductResponse)
  })

  it('Verify get review for review created via graphql', updateRetry(2), () => {
    cy.getReviewItems().then(review => {
      graphql(getReview(review[title]), response => {
        expect(response.body.data.review).to.not.equal(null)
      })
    })
  })

  it(
    'Verify edit review for review created via graphql',
    updateRetry(2),
    () => {
      cy.getReviewItems().then(review => {
        graphql(editReview(review[title], anonymousUser2), response => {
          expect(response.body).to.not.have.own.property('errors')
          expect(response.body.data.review).to.not.equal(null)
        })
      })
    }
  )

  it('Verify hasShopperReviewed', updateRetry(2), () => {
    graphql(gethasShopperReviewedQuery(), ValidateHasShopperReviewedResponse)
  })

  it('Verify get review for review created via UI', updateRetry(2), () => {
    cy.getReviewItems().then(review => {
      graphql(getReview(review[testCase1.anonymousUser1.name]), response => {
        expect(response.body.data.review).to.not.equal(null)
        cy.setReviewItem(
          reviewDateTimeEnv,
          response.body.data.review.reviewDateTime
        )
      })
    })
  })

  it('Verify get reviews query', updateRetry(2), () => {
    cy.getReviewItems().then(review => {
      graphql(getReviews(review[productId]), validateGetReviewsResponse)
    })
  })

  it('Verify reviewByDateRange query', updateRetry(2), () => {
    cy.getReviewItems().then(review => {
      graphql(
        getreviewByDateRangeQuery(review[reviewDateTimeEnv]),
        ValidateGetreviewByDateRangeQueryResponse
      )
    })
  })

  it('Verify get average of product by id query', updateRetry(4), () => {
    cy.addDelayBetweenRetries(2000)
    graphql(getAverageRatingByProductId(productId), response => {
      expect(response.body).to.not.have.own.property('errors')
      expect(response.body.data.averageRatingByProductId).to.not.equal(null)
      expect(response.body.data.averageRatingByProductId).to.equal(
        anonymousUser2.rating
      )
    })
  })
})
