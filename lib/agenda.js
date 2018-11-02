var reqlib = require('app-root-path').require
  , Agenda = require('agenda')
  , bunyan = require('bunyan')
  , downloadJob = reqlib('jobs/download-job')
  , dbconnect = reqlib('lib/dbconnect')
  ;

var agenda = new Agenda()
      .database(dbconnect.connString(), 'agendaJobs')
  , logger = bunyan.createLogger({
      name: 'cardgen-jobs',
      serializers: bunyan.stdSerializers
    })
  ;

agenda.on('ready', () => {
  logger.info({}, 'Ready to begin processing jobs');
})

agenda.on('error', (err) => {
  logger.error({ err: err }, 'Failed to initialize job processor');
});

agenda.on('start', job => {
  logger.info({ jobName: job.attrs.name }, 'Start job');
});

agenda.on('fail', (err, job) => { 
  logger.error({ err: err }, 'Job failed')
});

downloadJob.define(agenda, logger);

module.exports = agenda;

