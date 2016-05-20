'use strict';
define(['backbone', 'utils'],
    function(Backbone, Utils) {
        testSetup('Utils', function() {
            describe('TimeSpan', function() {
                before(function() {
                    this.getTimeSpan = function(days, hours, minutes, seconds, milliseconds) {
                        return {
                            days: days || 0,
                            hours: hours || 0,
                            minutes: minutes || 0,
                            seconds: seconds || 0,
                            milliseconds: milliseconds || 0
                        };
                    };
                });

                describe('parse', function() {
                    it('should return a timespan object if the input is dd.hh:MM:ss.mmm', function() {
                        var input = '7.01:02:03.004';
                        var expected = this.getTimeSpan(7, 1, 2, 3, 4);
                        var actual = Utils.timespan.parse(input);
                        expect(actual).to.deep.equal(expected);
                    });

                    it('should return a timespan object if the input is dd.hh:MM:ss', function() {
                        var input = '7.01:02:03';
                        var expected = this.getTimeSpan(7, 1, 2, 3, 0);
                        var actual = Utils.timespan.parse(input);
                        expect(actual).to.deep.equal(expected);
                    });

                    it('should return a timespan object if the input is hh:MM:ss.mmm', function() {
                        var input = '01:02:03.004';
                        var expected = this.getTimeSpan(0, 1, 2, 3, 4);
                        var actual = Utils.timespan.parse(input);
                        expect(actual).to.deep.equal(expected);
                    });

                    it('should return a timespan object if the input is hh:MM:ss', function() {
                        var input = '01:02:03';
                        var expected = this.getTimeSpan(0, 1, 2, 3, 0);
                        var actual = Utils.timespan.parse(input);
                        expect(actual).to.deep.equal(expected);
                    });
                });
            });

            describe('String', function() {
                describe('Format', function() {

                    it('Should replace any occurence of $1 in the string with the first argument', function() {
                        var testString = 'this is a $1';
                        var res = Utils.string.format(testString, 'string');
                        expect(res).to.equal('this is a string');
                    });

                    it('Should replace any occurence of $2 in the string with the second argument', function() {
                        var testString = 'this is a $2';
                        var res = Utils.string.format(testString, 'string', 'second string');
                        expect(res).to.equal('this is a second string');
                    });

                    it('Should replace multiple occurences of $n in the string with the nth argument', function() {
                        var testString = 'this $1 $2 $3';
                        var res = Utils.string.format(testString, 'is', 'a', 'string');
                        expect(res).to.equal('this is a string');
                    });
                });
            });
        });
    });
