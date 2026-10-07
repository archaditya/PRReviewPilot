const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const JobEvent = sequelize.define('JobEvent', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    reviewJobId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'review_job_id',
    },
    eventType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'event_type', // 'job_queued', 'diff_fetched', 'ai_analysis_started', 'ai_analysis_completed', 'comments_posted', 'job_failed'
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  }, {
    tableName: 'job_events',
    underscored: true,
    timestamps: true,
    updatedAt: false,
  });

  return JobEvent;
};
