(function (window, angular, undefined) {
    'use strict';

    angular.module('savePumpkin.loanCalc', ['ng'])

        .service('loanCalc', function () {
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
                        console.log('mr = ' + mr + ', + o = ' + o);
                    });
                    console.log('g2 o = ' + o);
                    return this.g2(interestRates, n - 1) + o;
                },
                getTerm: function (interestRates) {
                    var months = 0;
                    interestRates.map(function (r) {
                        months = months + r.months;
                    });
                    return months;
                },
                getInstalment: function (principal, interestRates) {
                    var f2 = this.f2(interestRates, interestRates.length - 1);
                    var g2 = this.g2(interestRates, interestRates.length - 1);
                    console.log('f2 = ' + f2);
                    console.log('g2 = ' + g2);
                    return principal * f2 / g2;
                },
                calculate: function (principal, interestRates, callback) {
                    var instalment = this.getInstalment(principal, interestRates);
                    var term = this.getTerm(interestRates);
                    var data = {
                        principal: principal,
                        interestRates: interestRates,
                        term: term,
                        instalment: instalment
                    };
                    callback(data);
                }

            };
        })

};