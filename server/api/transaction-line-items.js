const { transactionLineItems } = require('../api-util/lineItems');
const { getSdk, handleError } = require('../api-util/sdk');

module.exports = (req, res) => {
  const { isOwnListing, listingId, bookingData } = req.body;

  const sdk = getSdk(req, res);

  const listingPromise = isOwnListing
    ? sdk.ownListings.show({ id: listingId })
    : sdk.listings.show({ id: listingId });

  listingPromise
    .then(apiResponse => {
      const listing = apiResponse.data.data;
      const lineItems = transactionLineItems(listing, bookingData);
      res
        .status(200)
        .json(lineItems)
        .end();
    })
    .catch(e => {
      handleError(res, e);
    });
};
