const Train = require('../models/Train');

const CLASS_MULTIPLIERS = {
  General: 1.0,
  Sleeper: 1.3,
  '3AC': 1.8,
  '2AC': 2.5,
  '1AC': 3.5,
};

const normalizePassengers = (passengers) => (
  passengers.map((passenger) => ({
    ...passenger,
    age: Number.parseInt(passenger.age, 10),
  }))
);

const assignSeats = (passengers, seatClass) => (
  passengers.map((passenger) => ({
    ...passenger,
    seatNumber: `${seatClass.replace(/\s/g, '').charAt(0)}${Math.floor(Math.random() * 72) + 1}`,
  }))
);

const buildBookingQuote = async (payload) => {
  const { trainId, journeyDate, seatClass, passengers, contactInfo } = payload || {};

  if (!trainId || !journeyDate || !seatClass || !passengers || !passengers.length) {
    const error = new Error('All fields are required.');
    error.statusCode = 400;
    throw error;
  }

  const journey = new Date(journeyDate);
  if (Number.isNaN(journey.getTime())) {
    const error = new Error('Journey date is invalid.');
    error.statusCode = 400;
    throw error;
  }

  const normalizedPassengers = normalizePassengers(passengers);
  const hasInvalidPassenger = normalizedPassengers.some((passenger) => (
    !passenger.name
    || !String(passenger.name).trim()
    || !Number.isInteger(passenger.age)
    || passenger.age < 1
    || passenger.age > 120
  ));

  if (hasInvalidPassenger) {
    const error = new Error('Passenger details are invalid.');
    error.statusCode = 400;
    throw error;
  }

  const train = await Train.findById(trainId);
  if (!train || !train.isActive) {
    const error = new Error('Train not found.');
    error.statusCode = 404;
    throw error;
  }

  if (train.availableSeats < normalizedPassengers.length) {
    const error = new Error('Not enough seats available.');
    error.statusCode = 400;
    throw error;
  }

  const farePerPassenger = Math.round(train.baseFare * (CLASS_MULTIPLIERS[seatClass] || 1.0));
  const baseFare = farePerPassenger * normalizedPassengers.length;
  const taxes = Math.round(baseFare * 0.05);
  const totalFare = baseFare + taxes;

  return {
    train,
    journeyDate: journey,
    seatClass,
    passengers: normalizedPassengers,
    contactInfo,
    farePerPassenger,
    baseFare,
    taxes,
    totalFare,
  };
};

const buildBookingData = (quote, userId, overrides = {}) => ({
  user: userId,
  train: quote.train._id,
  trainSnapshot: {
    trainNumber: quote.train.trainNumber,
    trainName: quote.train.trainName,
    source: quote.train.source,
    destination: quote.train.destination,
    departureTime: quote.train.departureTime,
    arrivalTime: quote.train.arrivalTime,
    trainType: quote.train.trainType,
  },
  passengers: assignSeats(quote.passengers, quote.seatClass),
  contactInfo: quote.contactInfo,
  journeyDate: quote.journeyDate,
  seatClass: quote.seatClass,
  baseFare: quote.baseFare,
  taxes: quote.taxes,
  totalFare: quote.totalFare,
  ...overrides,
});

module.exports = {
  buildBookingData,
  buildBookingQuote,
};
