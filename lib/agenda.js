var reqlib = require('app-root-path').require
  , Agenda = require('agenda')
  , bunyan = require('bunyan')
  , downloadJob = reqlib('jobs/download-job')
  , dbconnect = reqlib('lib/dbconnect')
  ;

var agenda = new Agenda()
  .database(dbconnect.connString(), 'agendaJobs');

agenda.on('ready', () => {
  console.log('Ready to begin processing jobs');
})

agenda.on('error', (err) => {
  console.log(err);
});

agenda.on('start', job => {
  console.log('Job %s starting', job.attrs.name);
});

agenda.on('fail', (err, job) => { 
  console.log('Job failed with error: %s', err.message);
});

downloadJob.define(agenda, bunyan.createLogger({
  name: 'cardgen-jobs'
}));
agenda.start();

module.exports = agenda;

