declare var self: Worker;
import * as bitcoin from "bitcoinjs-lib";
import BIP32Factory from "bip32";
import * as ecc from "tiny-secp256k1";
import * as bip39 from "bip39";
const bip32 = BIP32Factory(ecc);
function getAddress(node: any, network?: any): string {
  return bitcoin.payments.p2pkh({ pubkey: node.publicKey, network }).address!;
}
self.onmessage = (event: MessageEvent) => {
  for (let index = 0; index < event.data.sentences.length; index++) {
    const seed = bip39.mnemonicToSeedSync(event.data.sentences[index]);
    const node = bip32.fromSeed(seed);
    const strng = node.toBase58();
    const restored = bip32.fromBase58(strng);
    if (getAddress(node) == "1K4ezpLybootYF23TM4a8Y4NyP7auysnRo") {
      postMessage({
        type: "log",
        message: `ACHOUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU addr checksum: ${getAddress(
          restored
        )} ACHOUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU WIF checksum: ${restored.toWIF()}`,
      });
      postMessage({
        type: "finish",
        message: "ACABOU",
      });
    }
    postMessage({
      type: "log",
      message: `addr checksum: ${getAddress(
        restored
      )} WIF checksum: ${restored.toWIF()}`,
    });
    if ((event.data.sentences.length - 1) === index) {
      postMessage({
        type: "finish",
        message: "ACABOU",
      });
    }
  }
};
