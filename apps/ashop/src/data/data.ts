export const sampleTrip = {
    type: 'ashop-trip',
    uploadedBy: 'nicholas.shaffer@noaa.gov',
    uploadedDate: '2019-05-29T12:13:00-07:00',
    operationIDs: [],
    vessel: 4487,
    departureDate: '2008-05-13T08:00:00-07:00',
    returnDate: '2008-06-17T12:00:00-07:00',
    departurePort: {
      _id: '800f861a2dbf141f75a309dfe06e3792',
      _rev: '1-eafacc4bbcd478edf413445d48c02c86',
      type: 'ashop-port',
      portCode: 15,
      name: 'Seattle',
      state: 'WA'
    },
    returnPort: {
      _id: '800f861a2dbf141f75a309dfe06e3792',
      _rev: '1-eafacc4bbcd478edf413445d48c02c86',
      type: 'ashop-port',
      portCode: 15,
      name: 'Seattle',
      state: 'WA'
    },
    tripNum: 1,
    observers: [11889, [11889], [11956]],
    crewSize: 212,
    didFishingOccur: true,
    legacy: {
      cruiseNum: 11889,
      tripSeq: 61,
      cruiseVesselSeq: 41
    }
  };

export const sampleData = {
    wcgop:
        [
            {
                doc: {
                    operationNum: 19,
                    observerTotalCatch: {
                    weightMethod: {lookupVal: 12},
                    value: 42.234534536524563456
                    },
                    gearPerformance: {lookupVal: 12, description: 'not good'},
                    targetStrategy: {
                    code: 'URK1'
                    },
                    gearType: 'Trawl',
                    setTime: '2019-03-08T12:13:00-07:00',
                    upDate: '2019-07-08T12:13:00-11:00',
                    errors: 99
                }
            },
            {
                doc: {
                    operationNum: 18,
                    observerTotalCatch: {
                    weightMethod: {lookupVal: 10},
                    value: 32.23453463456356
                    },
                    gearPerformance: {lookupVal: 2, description: 'a ok'},
                    targetStrategy: {
                    code: 'URK1'
                    },
                    gearType: 'Fixed Gear',
                    setTime: '2019-12-19T12:13:00-07:00',
                    upDate: '2019-12-20T12:13:00-11:00',
                    errors: 12
                }
            },
            {
                doc: {
                    operationNum: 17,
                    observerTotalCatch: {
                    weightMethod: {lookupVal: 9},
                    value: 3.1415926
                    },
                    gearPerformance: {lookupVal: 7, description: 'meh'},
                    targetStrategy: {
                    code: 'URK1'
                    },
                    gearType: 'Trawl',
                    setTime: '2019-08-03T09:08:00-07:00',
                    upDate: '2019-12-02T09:07:00-07:00',
                    errors: 0
                }
            },
        ],
    ashop:
        [
            {
            doc: {
                haulNum: 46,
                observerEstimatedCatch: {
                    measurement: {
                    value: 99.999999999
                    }
                },
                vesselEstimatedCatch: {
                    measurement: {
                    value: 634.452345342
                    }
                },
                totalEstimatedDiscard: {
                    value: 234.23453452345
                },
                startFishingLocation: {
                    date: '2019-05-29T12:13:00-07:00'
                }
                }
            },
            {
            doc: {
                haulNum: 45,
                observerEstimatedCatch: {
                    measurement: {
                    value: 34.343452345234
                    }
                },
                vesselEstimatedCatch: {
                    measurement: {
                    value: 444.23456345634653
                    }
                },
                totalEstimatedDiscard: {
                    value: 123.555555
                },
                startFishingLocation: {
                    date: '2019-05-29T12:13:00-07:00'
                }
                }
            },
            {
            doc: {
                haulNum: 44,
                observerEstimatedCatch: {
                    measurement: {
                    value: 17.345634563456345
                    }
                },
                vesselEstimatedCatch: {
                    measurement: {
                    value: 999.532453452342
                    }
                },
                totalEstimatedDiscard: {
                    value: 33.3333333333333
                },
                startFishingLocation: {
                    date: '2019-05-29T12:08:00-07:00'
                }
                }
            },
        ]
  };
