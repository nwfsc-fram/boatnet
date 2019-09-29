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
                    operationNum: 17,
                    observerTotalCatch: {
                    weightMethod: 12,
                    value: 42
                    },
                    gearPerformance: 5,
                    targetStrategy: {
                    code: 'URK1'
                    },
                    gearType: 'Pot',
                    setTime: '2019-05-29T12:13:00-07:00',
                    upDate: '2019-05-29T12:13:00-011:00',
                    errors: 99
                }
            },
            {
                doc: {
                    operationNum: 18,
                    observerTotalCatch: {
                    weightMethod: 10,
                    value: 32
                    },
                    gearPerformance: 2,
                    targetStrategy: {
                    code: 'URK1'
                    },
                    gearType: 'Trap',
                    setTime: '2019-05-29T12:13:00-07:00',
                    upDate: '2019-05-29T12:13:00-011:00',
                    errors: 12
                }
            },
            {
                doc: {
                    operationNum: 19,
                    observerTotalCatch: {
                    weightMethod: 9,
                    value: 3
                    },
                    gearPerformance: 7,
                    targetStrategy: {
                    code: 'URK1'
                    },
                    gearType: 'Pot',
                    setTime: '2019-05-29T12:13:00-07:00',
                    upDate: '2019-05-29T12:13:00-011:00',
                    errors: 0
                }
            },
        ],
    ashop:
        [
            {
            doc: {
                haulNum: 44,
                observerEstimatedCatch: {
                    measurement: {
                    value: 99
                    }
                },
                vesselEstimatedCatch: {
                    measurement: {
                    value: 634
                    }
                },
                totalEstimatedDiscard: {
                    value: 234
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
                    value: 34
                    }
                },
                vesselEstimatedCatch: {
                    measurement: {
                    value: 444
                    }
                },
                totalEstimatedDiscard: {
                    value: 123
                },
                startFishingLocation: {
                    date: '2019-05-29T12:13:00-07:00'
                }
                }
            },
            {
            doc: {
                haulNum: 46,
                observerEstimatedCatch: {
                    measurement: {
                    value: 17
                    }
                },
                vesselEstimatedCatch: {
                    measurement: {
                    value: 999
                    }
                },
                totalEstimatedDiscard: {
                    value: 333
                },
                startFishingLocation: {
                    date: '2019-05-29T12:13:00-07:00'
                }
                }
            },
        ]
  };
