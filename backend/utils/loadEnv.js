const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envFiles = [
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../.env'),
];

const isBlank = (value) => value === undefined || value === '';

const formatEnvFiles = (filePaths) => {
  if (filePaths.length === 0) return 'none';

  return filePaths
    .map((filePath) => path.relative(process.cwd(), filePath) || path.basename(filePath))
    .join(', ');
};

const loadedEnvFiles = [];

envFiles.forEach((filePath) => {
  if (!fs.existsSync(filePath)) return;

  try {
    const parsed = dotenv.parse(fs.readFileSync(filePath));

    Object.entries(parsed).forEach(([key, value]) => {
      if (isBlank(process.env[key])) {
        process.env[key] = value;
      }
    });

    loadedEnvFiles.push(filePath);
  } catch (err) {
    throw new Error(`Failed to load environment file ${formatEnvFiles([filePath])}: ${err.message}`);
  }
});

const requireEnv = (requiredGroups) => {
  const missing = requiredGroups
    .map((group) => (Array.isArray(group) ? group : [group]))
    .filter((group) => group.every((key) => isBlank(process.env[key])))
    .map((group) => group.join(' or '));

  if (missing.length === 0) return;

  throw new Error(
    `Missing required environment variables: ${missing.join(', ')}. ` +
    `Checked .env files: ${formatEnvFiles(envFiles)}. ` +
    `Loaded .env files: ${formatEnvFiles(loadedEnvFiles)}.`
  );
};

module.exports = {
  loadedEnvFiles,
  requireEnv,
};
