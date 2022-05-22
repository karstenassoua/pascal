"use strict";

var Community = require('../models/Community');

exports.getComm = function (req, res) {
  // eslint-disable-next-line array-callback-return
  Community.find(function (err, docs) {
    res.render('community', {
      community: docs
    });
  });
};