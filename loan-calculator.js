'use strict';

angular.module('ThePFMind.loanCalculator', [])

    .service('loanCalculator', function () {
        return {
            f1: function (i, m) { // i = interest per month, m = months
                return i * Math.pow(1 + i, m);
            },
            f2: function (interestRates, n) {
                if (n < 0) return 1;
                var r = interestRates[n];
                var o = 1;
                if (r.rate > 0)
                    o = this.f1(r.rate / 12 / 100, r.months);
                return this.f2(interestRates, n - 1) * o;
            },
            g2: function (interestRates, n) {
                if (n < 0) return 0;

                var o = 1;
                interestRates.map(function (r, i) {
                    var mr = r.rate / 12 / 100;
                    if (mr > 0) {
                        if (i < n) {
                            o = o * mr;
                        } else if (i == n) {
                            o = o * (Math.pow(1 + mr, r.months) - 1);
                        } else {
                            o = o * mr * (Math.pow(1 + mr, r.months));
                        }
                    } else {
                        if (i == n) {
                            o = o * r.months;
                        }
                    }
                });
                return this.g2(interestRates, n - 1) + o;
            },
            getInstalment: function (principal, interestRates) {
                var f2 = this.f2(interestRates, interestRates.length - 1);
                var g2 = this.g2(interestRates, interestRates.length - 1);
                return principal * f2 / g2;
            },
            perpareInterestRates: function (interestRates, term) {
                var totalMonths = 12 * term;
                var interestRatesCopy = [];
                angular.copy(interestRates, interestRatesCopy);
                interestRatesCopy.map(function (r, i, a) {
                    if (totalMonths == 0) {
                        a[i].months = 0;
                    } else {
                        totalMonths = totalMonths - parseFloat(r.months);
                        if (totalMonths < 0) {
                            a[i].months = parseFloat(totalMonths) + parseFloat(a[i].months);
                            totalMonths = 0;
                        }
                        if (i == a.length - 1 && totalMonths > 0) {
                            a[i].months = parseFloat(totalMonths) + parseFloat(a[i].months);
                        }
                    }
                });

                // remove months = 0;
                interestRatesCopy = interestRatesCopy.filter(function (e) {
                    return e.months > 0;
                });

                return interestRatesCopy;
            },
            calculate: function (principal, interestRates, term, callback) {

                var interestRatesCopy = this.perpareInterestRates(interestRates, term);

                var instalment = this.getInstalment(principal, interestRatesCopy, term);

                var data = {
                    principal: principal,
                    interestRates: interestRatesCopy,
                    term: term,                     // Years
                    months: 12 * term,
                    instalment: instalment
                };
                callback(data);
            }

        };
    });

