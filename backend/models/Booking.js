// models/Booking.js
const supabase = require('../utils/supabaseClient');

const TABLE = 'bookings';

const attachId = (row) => {
  if (!row) return null;
  row._id = row.id;
  return row;
};

const buildFilter = (query, builder) => {
  if (!query) return builder;
  if (query.user) builder = builder.eq('user', query.user);
  if (query.status) builder = builder.eq('status', query.status);
  if (query.pnrNumber) builder = builder.eq('pnrNumber', query.pnrNumber);
  if (query.search) builder = builder.ilike('pnrNumber', `%${query.search}%`);
  return builder;
};

const generatePNR = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let pnr = 'PNR';
  for (let i = 0; i < 9; i += 1) {
    pnr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pnr;
};

const Booking = {
  async create(payload) {
    const bookingData = {
      ...payload,
      pnrNumber: payload.pnrNumber || generatePNR(),
      journeyDate: payload.journeyDate,
    };
    const { data, error } = await supabase.from(TABLE).insert(bookingData).select().single();
    if (error) throw error;
    return attachId(data);
  },

  async find(query = {}, options = {}) {
    let builder = supabase.from(TABLE).select('*');
    builder = buildFilter(query, builder);
    if (options.page && options.limit) {
      builder = builder.range((options.page - 1) * options.limit, options.page * options.limit - 1);
    } else if (options.limit) {
      builder = builder.limit(options.limit);
    }
    if (options.order) {
      builder = builder.order(options.order.column, { ascending: options.order.ascending });
    }
    const { data, error } = await builder;
    if (error) throw error;
    return (data || []).map(attachId);
  },

  async findOne(query = {}) {
    let builder = supabase.from(TABLE).select('*');
    builder = buildFilter(query, builder);
    const { data, error } = await builder.limit(1).single();
    if (error && error.status !== 406) throw error;
    return attachId(data);
  },

  async findById(id) {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
    if (error && error.status !== 406) throw error;
    return attachId(data);
  },

  async findByIdAndUpdate(id, update) {
    const { data, error } = await supabase.from(TABLE).update(update).eq('id', id).select().single();
    if (error) throw error;
    return attachId(data);
  },

  async countDocuments(query = {}) {
    let builder = supabase.from(TABLE).select('id', { count: 'exact', head: true });
    builder = buildFilter(query, builder);
    const { count, error } = await builder;
    if (error) throw error;
    return count || 0;
  },
};

module.exports = Booking;
