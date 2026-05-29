// models/Station.js
const supabase = require('../utils/supabaseClient');

const TABLE = 'stations';

const attachId = (row) => {
  if (!row) return null;
  row._id = row.id;
  return row;
};

const buildFilter = (query, builder) => {
  if (!query) return builder;
  if (query.q) {
    builder = builder.or(`name.ilike.%${query.q}%,city.ilike.%${query.q}%`);
  }
  if (query.isActive !== undefined) builder = builder.eq('isActive', query.isActive);
  return builder;
};

const Station = {
  async find(query = {}, options = {}) {
    let builder = supabase.from(TABLE).select('*');
    builder = buildFilter(query, builder);
    if (options.limit) builder = builder.limit(options.limit);
    const { data, error } = await builder;
    if (error) throw error;
    return (data || []).map(attachId);
  },
};

module.exports = Station;
