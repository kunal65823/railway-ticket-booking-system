// models/User.js
const bcrypt = require('bcryptjs');
const supabase = require('../utils/supabaseClient');

const TABLE = 'users';

const attachMethods = (row) => {
  if (!row) return null;
  row._id = row.id;
  row.comparePassword = async (enteredPassword) => bcrypt.compare(enteredPassword, row.password || '');
  return row;
};

const buildFilter = (query, builder) => {
  if (!query) return builder;
  if (query.email) builder = builder.eq('email', query.email.toLowerCase());
  if (query.role) builder = builder.eq('role', query.role);
  if (query.isActive !== undefined) builder = builder.eq('isActive', query.isActive);
  if (query.$or) {
    const orClauses = query.$or.map((cond) => {
      const key = Object.keys(cond)[0];
      const value = cond[key];
      if (key === 'email') return `email.ilike.%${value}%`;
      if (key === 'name') return `name.ilike.%${value}%`;
      return '';
    }).filter(Boolean);
    if (orClauses.length) builder = builder.or(orClauses.join(','));
  }
  if (query.name) builder = builder.ilike('name', `%${query.name}%`);
  if (query.emailSearch) builder = builder.ilike('email', `%${query.emailSearch}%`);
  return builder;
};

const User = {
  async findOne(query, options = {}) {
    let builder = supabase.from(TABLE).select(options.select || '*');
    builder = buildFilter(query, builder);
    const response = await builder.limit(1).single();
    if (response.error && response.status !== 406) throw response.error;
    return attachMethods(response.data);
  },

  async findById(id) {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
    if (error && error.status !== 406) throw error;
    return attachMethods(data);
  },

  async findByIdAndUpdate(id, update) {
    const { data, error } = await supabase.from(TABLE).update(update).eq('id', id).select().single();
    if (error) throw error;
    return attachMethods(data);
  },

  async create(payload) {
    const password = await bcrypt.hash(payload.password, 12);
    const insertData = {
      ...payload,
      email: payload.email.toLowerCase(),
      password,
      role: payload.role || 'user',
      isActive: payload.isActive !== undefined ? payload.isActive : true,
    };
    const { data, error } = await supabase.from(TABLE).insert(insertData).select().single();
    if (error) throw error;
    return attachMethods(data);
  },

  async countDocuments(query = {}) {
    let builder = supabase.from(TABLE).select('id', { count: 'exact' }).limit(0);
    builder = buildFilter(query, builder);
    const { count, error } = await builder;
    if (error) throw error;
    return count || 0;
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
    return (data || []).map(attachMethods);
  },
};

module.exports = User;
