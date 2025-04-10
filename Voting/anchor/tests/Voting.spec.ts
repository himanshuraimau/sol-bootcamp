
import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair, PublicKey } from '@solana/web3.js'
import { Voting } from '../target/types/Voting'
import { startAnchor } from 'anchor-bankrun'
import { BankrunProvider } from 'anchor-bankrun'


const IDL = require('../target/idl/votingdapp.json')

const votingAddress = new PublicKey("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF")


describe('votingdapp', () => {

  it('Initializes Poll', async () => {
    const context = await startAnchor("", [{ "name": "votingdapp", programId: votingAddress }], []);
    const provider = new BankrunProvider(context);

    const votingProgram = new Program<Voting>(
      IDL,
      provider
    );

    await votingProgram.methods.initializePoll(
      new anchor.BN(1),
      "What is your favorite color?", 
      new anchor.BN(0),
      new anchor.BN(1844306210)
    ).rpc();
  })
})
