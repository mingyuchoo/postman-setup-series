import newman from 'newman';
import glob from 'glob';

const filePath = 'tests/api/';

let envFile = '';
const myArgs = process.argv.slice(2);
switch (myArgs[0]) {
  case 'local':
    envFile = './environments/local.postman_environment.json';
    break;
  case 'stage':
    envFile = './environments/stage.postman_environment.json';
    break;
  default:
    console.log('Sorry, that is not something I know how to do.');
}

let testLevel = myArgs[1];
if (['module', 'health', 'smoke'].includes(myArgs[1])) {
  testLevel = myArgs[1];
} else {
  console.log('Sorry, that is not right test level in [module, health, smoke]');
}

glob(`./${filePath}/collections/${testLevel}/**/*.json`, {}, (err, matches) => {
  matches.forEach((item, index) => {
    const collPath = item.replace(filePath, '');
    newman
      .run({
        environment: require(envFile),
        collection: require(collPath),
        reporters: 'cli',
      })
      .on('start', (err, args) => {
        console.log('>>> running a collection');
      })
      .on('done', (err, summary) => {
        if (err || summary.error) {
          console.error('>>> collection run encountered an error.');
        } else {
          console.log('>>> collection run completed.');
        }
      });
  });
});
