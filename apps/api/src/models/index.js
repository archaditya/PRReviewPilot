const { Sequelize } = require('sequelize');
const config = require('../config');
const logger = require('../utils/logger');

const sequelize = new Sequelize(config.db.url, {
  dialect: 'postgres',
  logging: (msg) => logger.debug(msg),
  pool: config.db.pool,
});

// Initialize models
const User = require('./user.model')(sequelize);
const Organization = require('./organization.model')(sequelize);
const OrganizationMember = require('./organization-member.model')(sequelize);
const Repository = require('./repository.model')(sequelize);
const PullRequest = require('./pull-request.model')(sequelize);
const ReviewJob = require('./review-job.model')(sequelize);
const ReviewFinding = require('./review-finding.model')(sequelize);
const JobEvent = require('./job-event.model')(sequelize);
const ApiKey = require('./api-key.model')(sequelize);
const Installation = require('./installation.model')(sequelize);

// Associations

// Organization <-> Installations
Organization.hasMany(Installation, { foreignKey: 'organization_id', as: 'installations' });
Installation.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });

// Installation <-> Repositories
Installation.hasMany(Repository, { foreignKey: 'installation_id', as: 'repositories' });
Repository.belongsTo(Installation, { foreignKey: 'installation_id', as: 'installation' });

// User <-> Organization (Ownership)
User.hasMany(Organization, { foreignKey: 'owner_user_id', as: 'ownedOrganizations' });
Organization.belongsTo(User, { foreignKey: 'owner_user_id', as: 'owner' });

// Organization <-> Members <-> Users (Many-to-Many via OrganizationMember)
Organization.hasMany(OrganizationMember, { foreignKey: 'organization_id', as: 'memberships' });
OrganizationMember.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });

User.hasMany(OrganizationMember, { foreignKey: 'user_id', as: 'memberships' });
OrganizationMember.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Organization.belongsToMany(User, {
  through: OrganizationMember,
  foreignKey: 'organization_id',
  otherKey: 'user_id',
  as: 'members',
});
User.belongsToMany(Organization, {
  through: OrganizationMember,
  foreignKey: 'user_id',
  otherKey: 'organization_id',
  as: 'organizations',
});

// Organization <-> Repositories
Organization.hasMany(Repository, { foreignKey: 'organization_id', as: 'repositories' });
Repository.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });

// Repository <-> PullRequests
Repository.hasMany(PullRequest, { foreignKey: 'repository_id', as: 'pullRequests' });
PullRequest.belongsTo(Repository, { foreignKey: 'repository_id', as: 'repository' });

// Repository <-> ReviewJobs
Repository.hasMany(ReviewJob, { foreignKey: 'repository_id', as: 'reviewJobs' });
ReviewJob.belongsTo(Repository, { foreignKey: 'repository_id', as: 'repository' });

// PullRequest <-> ReviewJobs
PullRequest.hasMany(ReviewJob, { foreignKey: 'pull_request_id', as: 'reviewJobs' });
ReviewJob.belongsTo(PullRequest, { foreignKey: 'pull_request_id', as: 'pullRequest' });

// ReviewJob <-> ReviewFindings
ReviewJob.hasMany(ReviewFinding, { foreignKey: 'review_job_id', as: 'findings' });
ReviewFinding.belongsTo(ReviewJob, { foreignKey: 'review_job_id', as: 'reviewJob' });

// ReviewJob <-> JobEvents
ReviewJob.hasMany(JobEvent, { foreignKey: 'review_job_id', as: 'events' });
JobEvent.belongsTo(ReviewJob, { foreignKey: 'review_job_id', as: 'reviewJob' });

// Organization <-> ApiKeys
Organization.hasMany(ApiKey, { foreignKey: 'organization_id', as: 'apiKeys' });
ApiKey.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });

const db = {
  sequelize,
  Sequelize,
  User,
  Organization,
  OrganizationMember,
  Repository,
  PullRequest,
  ReviewJob,
  ReviewFinding,
  JobEvent,
  ApiKey,
  Installation,
};

module.exports = db;
