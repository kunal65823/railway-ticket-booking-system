// models/Train.js
const supabase = require('../utils/supabaseClient');

const TABLE = 'trains';

const attachId = (row) => {
  if (!row) return null;
  row._id = row.id;
  return row;
};

const buildFilter = (query, builder) => {
  if (!query) return builder;
  if (query.source) builder = builder.ilike('source', `%${query.source}%`);
  if (query.destination) builder = builder.ilike('destination', `%${query.destination}%`);
  if (query.trainType) builder = builder.eq('trainType', query.trainType);
  if (query.isActive !== undefined) builder = builder.eq('isActive', query.isActive);
  if (query['classes.className']) {
    builder = builder.contains('classes', [{ className: query['classes.className'] }]);
  }
  return builder;
};

const Train = {
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

  async countDocuments(query = {}) {
    let builder = supabase.from(TABLE).select('id', { count: 'exact' }).limit(0);
    builder = buildFilter(query, builder);
    const { count, error } = await builder;
    if (error) throw error;
    return count || 0;
  },

  async findById(id) {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
    if (error && error.status !== 406) throw error;
    return attachId(data);
  },

  async create(payload) {
    const { data, error } = await supabase.from(TABLE).insert(payload).select().single();
    if (error) throw error;
    return attachId(data);
  },

  async findByIdAndUpdate(id, update) {
    const { data, error } = await supabase.from(TABLE).update(update).eq('id', id).select().single();
    if (error) throw error;
    return attachId(data);
  },
};

module.exports = Train;
