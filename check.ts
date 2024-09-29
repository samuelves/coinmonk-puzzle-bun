import * as bitcoin from "bitcoinjs-lib";
import BIP32Factory from "bip32";
import * as ecc from "tiny-secp256k1";
import * as bip39 from "bip39";
import { readFileSync } from "fs";

const bip32 = BIP32Factory(ecc);
const content = readFileSync("frases.txt", "utf8");
const pashesInList = content.split("\n");
function getAddress(node: any, network?: any): string {
  return bitcoin.payments.p2pkh({ pubkey: node.publicKey, network }).address!;
}
for (const pashe of pashesInList) {
  const seed = bip39.mnemonicToSeedSync(pashe);
  const node = bip32.fromSeed(seed);
  const strng = node.toBase58();
  const restored = bip32.fromBase58(strng);

  console.log(`addr checksum: ${getAddress(restored)} WIF checksum: ${restored.toWIF()}`);

  if(getAddress(node) == '1K4ezpLybootYF23TM4a8Y4NyP7auysnRo') {
    console.log("ACHOUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU")
    console.log(`addr : ${getAddress(node)} WIF: ${node.toWIF()}`);
    console.log(`addr checksum: ${getAddress(restored)} WIF checksum: ${restored.toWIF()}`);
  }
}
