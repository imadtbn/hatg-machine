const fs = require('fs');
const errors = JSON.parse(fs.readFileSync('data/errors.json', 'utf8'));
const taxonomy = JSON.parse(fs.readFileSync('data/taxonomy.json', 'utf8'));
const problems = [];
const ids = new Set();
const validDevices = new Set(Object.keys(taxonomy.deviceTypes));
const validGroups = new Set(Object.keys(taxonomy.faultGroups));
const validSubgroups = new Set(Object.keys(taxonomy.faultSubgroups));
const validScopes = new Set(Object.keys(taxonomy.modelScopes));
const validStatuses = new Set(Object.keys(taxonomy.verificationStatuses));
for (const item of errors) {
  if (ids.has(item.id)) problems.push(`duplicate id: ${item.id}`);
  ids.add(item.id);
  if (!validDevices.has(item.deviceType)) problems.push(`${item.id}: unknown deviceType ${item.deviceType}`);
  if (!validGroups.has(item.faultGroup)) problems.push(`${item.id}: unknown faultGroup ${item.faultGroup}`);
  if (!validSubgroups.has(item.faultSubgroup)) problems.push(`${item.id}: unknown faultSubgroup ${item.faultSubgroup}`);
  if (!validScopes.has(item.modelScope)) problems.push(`${item.id}: unknown modelScope ${item.modelScope}`);
  if (!validStatuses.has(item.verificationStatus)) problems.push(`${item.id}: unknown verificationStatus ${item.verificationStatus}`);
  if (!Array.isArray(item.deviceSubtype) || !item.deviceSubtype.length) problems.push(`${item.id}: deviceSubtype must be non-empty array`);
  if (!Array.isArray(item.faultTags) || !item.faultTags.length) problems.push(`${item.id}: faultTags must be non-empty array`);
  if (!Array.isArray(item.codes) || !item.codes.includes(item.displayCode)) problems.push(`${item.id}: displayCode missing from codes`);
  if (!Array.isArray(item.sourceUrls) || !item.sourceUrls.length) problems.push(`${item.id}: sourceUrls missing`);
}
const report = {
  valid: problems.length === 0,
  errors: errors.length,
  taxonomyDeviceTypes: validDevices.size,
  taxonomyFaultGroups: validGroups.size,
  classifiedRecords: errors.filter(item => item.faultGroup !== 'unknown').length,
  modelScopes: errors.reduce((out, item) => { out[item.modelScope] = (out[item.modelScope] || 0) + 1; return out; }, {}),
  faultGroups: errors.reduce((out, item) => { out[item.faultGroup] = (out[item.faultGroup] || 0) + 1; return out; }, {}),
  problems
};
console.log(JSON.stringify(report, null, 2));
if (problems.length) process.exit(1);
