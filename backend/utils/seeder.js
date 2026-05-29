// utils/seeder.js - Seeds initial data if tables are empty
const Train = require('../models/Train');
const User = require('../models/User');
const Station = require('../models/Station');

const seedData = async () => {
  try {
    const trainCount = await Train.countDocuments();
    if (trainCount === 0) {
      console.log('🌱 Seeding trains...');
      const trains = [
        {
          trainNumber: '12001', trainName: 'Shatabdi Express', source: 'Mumbai', destination: 'Delhi',
          departureTime: '06:00', arrivalTime: '22:00', duration: '16h 00m',
          totalSeats: 150, availableSeats: 142, trainType: 'Shatabdi', baseFare: 1200,
          classes: [
            { className: 'General', multiplier: 1.0, seatsAvailable: 30 },
            { className: 'Sleeper', multiplier: 1.3, seatsAvailable: 40 },
            { className: '3AC', multiplier: 1.8, seatsAvailable: 40 },
            { className: '2AC', multiplier: 2.5, seatsAvailable: 20 },
            { className: '1AC', multiplier: 3.5, seatsAvailable: 12 },
          ],
          daysOfOperation: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          distance: 1388, amenities: ['WiFi', 'Pantry Car', 'AC', 'Charging Points'], rating: 4.5,
        },
        {
          trainNumber: '12002', trainName: 'Rajdhani Express', source: 'Delhi', destination: 'Mumbai',
          departureTime: '16:35', arrivalTime: '08:35', duration: '16h 00m',
          totalSeats: 200, availableSeats: 185, trainType: 'Rajdhani', baseFare: 1800,
          classes: [
            { className: 'Sleeper', multiplier: 1.3, seatsAvailable: 60 },
            { className: '3AC', multiplier: 1.8, seatsAvailable: 60 },
            { className: '2AC', multiplier: 2.5, seatsAvailable: 50 },
            { className: '1AC', multiplier: 3.5, seatsAvailable: 30 },
          ],
          daysOfOperation: ['Mon', 'Wed', 'Fri', 'Sun'], distance: 1388,
          amenities: ['WiFi', 'Meals Included', 'AC', 'Blanket & Pillow'], rating: 4.7,
        },
        {
          trainNumber: '12003', trainName: 'Duronto Express', source: 'Pune', destination: 'Bangalore',
          departureTime: '07:15', arrivalTime: '19:30', duration: '12h 15m',
          totalSeats: 180, availableSeats: 170, trainType: 'Duronto', baseFare: 950,
          classes: [
            { className: 'General', multiplier: 1.0, seatsAvailable: 40 },
            { className: 'Sleeper', multiplier: 1.3, seatsAvailable: 60 },
            { className: '3AC', multiplier: 1.8, seatsAvailable: 50 },
            { className: '2AC', multiplier: 2.5, seatsAvailable: 30 },
          ],
          daysOfOperation: ['Tue', 'Thu', 'Sat'], distance: 840,
          amenities: ['Pantry Car', 'AC', 'Charging Points'], rating: 4.2,
        },
        {
          trainNumber: '12004', trainName: 'Garib Rath Express', source: 'Hyderabad', destination: 'Chennai',
          departureTime: '08:00', arrivalTime: '18:00', duration: '10h 00m',
          totalSeats: 200, availableSeats: 190, trainType: 'Express', baseFare: 650,
          classes: [
            { className: 'General', multiplier: 1.0, seatsAvailable: 80 },
            { className: 'Sleeper', multiplier: 1.3, seatsAvailable: 80 },
            { className: '3AC', multiplier: 1.8, seatsAvailable: 40 },
          ],
          daysOfOperation: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], distance: 620,
          amenities: ['Pantry Car', 'Charging Points'], rating: 3.8,
        },
        {
          trainNumber: '12005', trainName: 'Jan Shatabdi', source: 'Mumbai', destination: 'Goa',
          departureTime: '05:30', arrivalTime: '12:30', duration: '7h 00m',
          totalSeats: 120, availableSeats: 95, trainType: 'Shatabdi', baseFare: 750,
          classes: [
            { className: 'General', multiplier: 1.0, seatsAvailable: 40 },
            { className: 'Sleeper', multiplier: 1.3, seatsAvailable: 40 },
            { className: '3AC', multiplier: 1.8, seatsAvailable: 40 },
          ],
          daysOfOperation: ['Mon', 'Wed', 'Fri', 'Sat', 'Sun'], distance: 588,
          amenities: ['AC', 'Scenic Route', 'Pantry Car'], rating: 4.6,
        },
        {
          trainNumber: '12006', trainName: 'Karnataka Express', source: 'Bangalore', destination: 'Delhi',
          departureTime: '20:00', arrivalTime: '07:30', duration: '35h 30m',
          totalSeats: 250, availableSeats: 230, trainType: 'Express', baseFare: 1400,
          classes: [
            { className: 'General', multiplier: 1.0, seatsAvailable: 80 },
            { className: 'Sleeper', multiplier: 1.3, seatsAvailable: 80 },
            { className: '3AC', multiplier: 1.8, seatsAvailable: 60 },
            { className: '2AC', multiplier: 2.5, seatsAvailable: 20 },
            { className: '1AC', multiplier: 3.5, seatsAvailable: 10 },
          ],
          daysOfOperation: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], distance: 2361,
          amenities: ['Pantry Car', 'Charging Points', 'Bedroll'], rating: 4.0,
        },
        {
          trainNumber: '12007', trainName: 'Deccan Queen', source: 'Pune', destination: 'Mumbai',
          departureTime: '07:15', arrivalTime: '10:25', duration: '3h 10m',
          totalSeats: 100, availableSeats: 88, trainType: 'Express', baseFare: 350,
          classes: [
            { className: 'General', multiplier: 1.0, seatsAvailable: 40 },
            { className: 'Sleeper', multiplier: 1.3, seatsAvailable: 30 },
            { className: '3AC', multiplier: 1.8, seatsAvailable: 30 },
          ],
          daysOfOperation: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], distance: 192,
          amenities: ['AC', 'Dining Car', 'Scenic Route'], rating: 4.4,
        },
        {
          trainNumber: '12008', trainName: 'Golden Temple Mail', source: 'Mumbai', destination: 'Amritsar',
          departureTime: '21:30', arrivalTime: '23:45', duration: '26h 15m',
          totalSeats: 180, availableSeats: 160, trainType: 'Express', baseFare: 1600,
          classes: [
            { className: 'General', multiplier: 1.0, seatsAvailable: 50 },
            { className: 'Sleeper', multiplier: 1.3, seatsAvailable: 60 },
            { className: '3AC', multiplier: 1.8, seatsAvailable: 40 },
            { className: '2AC', multiplier: 2.5, seatsAvailable: 20 },
            { className: '1AC', multiplier: 3.5, seatsAvailable: 10 },
          ],
          daysOfOperation: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], distance: 1930,
          amenities: ['Pantry Car', 'Bedroll', 'Charging Points'], rating: 4.1,
        },
      ];
      await Promise.all(trains.map((train) => Train.create(train)));
      console.log('✅ Trains seeded!');
    }

    const adminExists = await User.findOne({ email: 'admin@railway.com' });
    if (!adminExists) {
      await User.create({
        name: 'System Admin',
        email: 'admin@railway.com',
        password: 'Admin@123',
        role: 'admin',
        phone: '9999999999',
      });
      console.log('✅ Admin user seeded! Email: admin@railway.com | Password: Admin@123');
    }

    const stationCount = await Station.countDocuments();
    if (stationCount === 0) {
      const stations = [
        { name: 'Mumbai Central', code: 'BCT', city: 'Mumbai', state: 'Maharashtra', platforms: 8 },
        { name: 'Delhi Junction', code: 'DLI', city: 'Delhi', state: 'Delhi', platforms: 16 },
        { name: 'Bangalore City', code: 'SBC', city: 'Bangalore', state: 'Karnataka', platforms: 10 },
        { name: 'Hyderabad Deccan', code: 'HYB', city: 'Hyderabad', state: 'Telangana', platforms: 8 },
        { name: 'Chennai Central', code: 'MAS', city: 'Chennai', state: 'Tamil Nadu', platforms: 12 },
        { name: 'Pune Junction', code: 'PUNE', city: 'Pune', state: 'Maharashtra', platforms: 6 },
        { name: 'Goa Madgaon', code: 'MAO', city: 'Goa', state: 'Goa', platforms: 4 },
        { name: 'Amritsar Junction', code: 'ASR', city: 'Amritsar', state: 'Punjab', platforms: 6 },
        { name: 'Kolkata Howrah', code: 'HWH', city: 'Kolkata', state: 'West Bengal', platforms: 23 },
        { name: 'Jaipur Junction', code: 'JP', city: 'Jaipur', state: 'Rajasthan', platforms: 8 },
      ];
      await Promise.all(stations.map((station) => Station.create(station)));
      console.log('✅ Stations seeded!');
    }
  } catch (err) {
    console.error('❌ Seeder error:', err);
  }
};

seedData();
module.exports = seedData;
