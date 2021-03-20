const { TestScheduler } = require("jest");
const newman = require("newman");
const glob = require("glob");

const filePath = "tests/api/";

// 테스트 환경 선택
let envFile = "";
const myArgs = process.argv.slice(2);
switch (myArgs[0]) {
  case "local":
    envFile = "./environments/local.postman_environment.json";
    break;
  case "develop":
    envFile = "./environments/develop.postman_environment.json";
    break;
  case "stage":
    envFile = "./environments/stage.postman_environment.json";
    break;
  case "prod":
    envFile = "./environments/prod.postman_environment.json";
    break;
  default:
    console.log("Sorry, that is not something I know how to do.");
    return -1;
}

// 테스트 레벨 선택
let testLevel = myArgs[1];
if (["module", "health", "smoke"].includes(myArgs[1])) {
  testLevel = myArgs[1];
} else {
  console.log("Sorry, that is not right test levels in [module, health, smoke]");
  return -2;
}

// Postman의 콜렉션 묶음별로 실행
glob(`./${filePath}/collections/${testLevel}/**/*.json`, {}, function (err, matches) {
  matches.forEach(function (item, index) {
    const collPath = item.replace(filePath, "");
    newman
      .run({
        environment: require(envFile),
        collection: require(collPath),
        reporters: "cli",
      })
      .on("start", function (err, args) {
        console.log(">>> running a collection");
      })
      .on("done", function (err, summary) {
        if (err || summary.error) {
          console.error(">>> collection run encountered an error.");
        } else {
          console.log(">>> collection run completed.");
        }
      });
  });
});
