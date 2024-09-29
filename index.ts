import os from "os";
import readline from "readline";
import { Database } from "bun:sqlite";
import chalk from "chalk";

const art = ` ██████╗ ██████╗ ██╗███╗   ██╗███╗   ███╗ ██████╗ ███╗   ██╗██╗  ██╗    ██████╗ ██╗   ██╗███╗   ██╗
██╔════╝██╔═══██╗██║████╗  ██║████╗ ████║██╔═══██╗████╗  ██║██║ ██╔╝    ██╔══██╗██║   ██║████╗  ██║
██║     ██║   ██║██║██╔██╗ ██║██╔████╔██║██║   ██║██╔██╗ ██║█████╔╝     ██████╔╝██║   ██║██╔██╗ ██║
██║     ██║   ██║██║██║╚██╗██║██║╚██╔╝██║██║   ██║██║╚██╗██║██╔═██╗     ██╔══██╗██║   ██║██║╚██╗██║
╚██████╗╚██████╔╝██║██║ ╚████║██║ ╚═╝ ██║╚██████╔╝██║ ╚████║██║  ██╗    ██████╔╝╚██████╔╝██║ ╚████║
 ╚═════╝ ╚═════╝ ╚═╝╚═╝  ╚═══╝╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═╝    ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝
                                                                                                   `;
let shouldStop = false;
let seedPassPhrase = 12;
let numThreads = 1;
let qtdSeedPassPhrasePerThread = 1;
const numThreadsAvailable = os.cpus().length - 2;
const db = new Database("words.db");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on("SIGINT", () => {
  shouldStop = true;
  rl.close();
  process.exit();
});

process.on("SIGINT", () => {
  shouldStop = true;
  rl.close();
  process.exit();
});

console.log(chalk.greenBright(art));
console.log(
  `             ${chalk.bgRed("IG: @ives.samuel | github/samuelves")}`
);
console.log(
  `${chalk.yellowBright("Threads available on your PC:")} ${chalk.cyan(
    numThreadsAvailable
  )}`
);
rl.question(
  `${chalk.yellowBright("How many threads do you want to use?")}${chalk.cyan(
    " 1 -",
    numThreadsAvailable
  )}): `,
  (threadCount) => {
    numThreads = parseInt(threadCount);
    if (numThreads > numThreadsAvailable) {
      rl.close();
      return;
    }
    rl.question(
      `${chalk.yellowBright(
        "Select quantity seed phrase (12, 18 or 24)"
      )} ${chalk.cyan(1)} - ${chalk.cyan(160)}: `,
      (answer) => {
        switch (parseInt(answer)) {
          case 12:
            seedPassPhrase = 12;
            break;
          case 18:
            seedPassPhrase = 18;
            break;
          case 24:
            seedPassPhrase = 18;
            break;
          default:
            seedPassPhrase = 12;
            break;
        }
        rl.question(
          `${chalk.yellowBright(
            "Select quantity seed phrase process per thread (recommend 10)"
          )} ${chalk.cyan(1)} - ${chalk.cyan(160)}: `,
          (seedPassPhrasePerThread) => {
            if (seedPassPhrasePerThread.toLowerCase() === "1") {
              start();
            }
            qtdSeedPassPhrasePerThread = parseInt(seedPassPhrasePerThread);
            start();
          }
        );
      }
    );
  }
);
function generateSentences() {
  const words = db
    .query("SELECT palavra FROM words")
    .all()
    .map((row) => row.palavra);

  if (words.length === 0) {
    throw new Error("check database");
  }
  const sentences = [];
  for (let i = 0; i < qtdSeedPassPhrasePerThread; i++) {
    const sentenceWords = [];
    for (let j = 0; j < seedPassPhrase; j++) {
      const randomIndex = Math.floor(Math.random() * words.length);
      sentenceWords.push(words[randomIndex]); // Pode repetir palavras
    }
    sentences.push(sentenceWords.join(" "));
  }
  return sentences;
}

function processSentenceInWorker(sentences: string[]) {
  const worker = new Worker("./worker.ts");

  worker.postMessage({ sentences });

  worker.onmessage = (event) => {
    console.log(`Worker retornou: ${JSON.stringify(event.data)}`);
    switch (event.data.type) {
      case "log":
        console.log(`Worker retornou message: ${event.data.message}`);
        break;
      case "finish":
        worker.terminate();
        break;
      default:
        break;
    }
  };
}

function start() {
  rl.close();
  for (let i = 0; i < numThreads; i++) {
    const sentences = generateSentences();
    processSentenceInWorker(sentences);
    if (i === numThreads) {
      db.close();
    }
  }
}
