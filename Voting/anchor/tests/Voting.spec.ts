import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair, PublicKey } from '@solana/web3.js'
import type { Voting } from '../target/types/Voting'
import { startAnchor } from 'anchor-bankrun'
import { BankrunProvider } from 'anchor-bankrun'


const IDL = require('../target/idl/Voting.json')

const votingAddress = new PublicKey("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF")


describe('Voting', () => {

  // Increase Jest timeout for this suite (e.g., 30 seconds)
  jest.setTimeout(30000);

  let context: any;
  let provider: anchor.AnchorProvider;
  let votingProgram: Program<Voting>;
  let pollAddress: PublicKey;

  beforeAll(async () => {
    // Use the correct program name "Voting" (capital V)
    context = await startAnchor("", [{ "name": "Voting", programId: votingAddress }], []);
    provider = new BankrunProvider(context) as unknown as anchor.AnchorProvider;

    votingProgram = new Program<Voting>(
      IDL,
      provider
    );
    // Compute poll PDA once for reuse
    pollAddress = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'be', 8)],
      votingAddress
    )[0];
  })

  it('Initializes Poll', async () => {
    await votingProgram.methods.initializePoll(
      new anchor.BN(1),
      "What is your favorite color?",
      new anchor.BN(0),
      new anchor.BN(1844306210)
    ).accounts({
      signer: provider.wallet.publicKey,
      poll: pollAddress,
      systemProgram: anchor.web3.SystemProgram.programId
    } as any).rpc();

    const poll = await votingProgram.account.poll.fetch(pollAddress);

    console.log(poll);

    expect(poll.pollId.toNumber()).toEqual(1);
    expect(poll.description).toEqual("What is your favorite color?");
    expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber());
  });

  it("initialize candidate  ", async () => {
    await votingProgram.methods.initializeCandidate(
      "Smooth",
      new anchor.BN(1),
    ).accounts({
      signer: provider.wallet.publicKey,
      poll: pollAddress,
      candidate: PublicKey.findProgramAddressSync(
        [new anchor.BN(1).toArrayLike(Buffer, 'be', 8), Buffer.from("Smooth")],
        votingAddress
      )[0],
      systemProgram: anchor.web3.SystemProgram.programId
    } as any).rpc();

    await votingProgram.methods.initializeCandidate(
      "Crunchy",
      new anchor.BN(1),
    ).accounts({
      signer: provider.wallet.publicKey,
      poll: pollAddress,
      candidate: PublicKey.findProgramAddressSync(
        [new anchor.BN(1).toArrayLike(Buffer, 'be', 8), Buffer.from("Crunchy")],
        votingAddress
      )[0],
      systemProgram: anchor.web3.SystemProgram.programId
    } as any).rpc();

    const candidate1 = await votingProgram.account.candidate.fetch(
      PublicKey.findProgramAddressSync(
        [new anchor.BN(1).toArrayLike(Buffer, 'be', 8), Buffer.from("Smooth")],
        votingAddress
      )[0]
    );
    const candidate2 = await votingProgram.account.candidate.fetch(
      PublicKey.findProgramAddressSync(
        [new anchor.BN(1).toArrayLike(Buffer, 'be', 8), Buffer.from("Crunchy")],
        votingAddress
      )[0]
    );
    console.log(candidate1);
    expect(candidate1.candidateName).toEqual("Smooth");
    expect(candidate1.candidateVotes.toNumber()).toEqual(new anchor.BN(0).toNumber());
    console.log(candidate2);
    expect(candidate2.candidateName).toEqual("Crunchy");
    expect(candidate2.candidateVotes.toNumber()).toEqual(new anchor.BN(0).toNumber());

  });
  it("vote", async () => {
    await votingProgram.methods.vote(
      "Smooth",
      new anchor.BN(1)
    ).accounts({
      signer: provider.wallet.publicKey,
      poll: pollAddress,
      candidate: PublicKey.findProgramAddressSync(
        [new anchor.BN(1).toArrayLike(Buffer, 'be', 8), Buffer.from("Smooth")],
        votingAddress
      )[0],
    } as any).rpc();

    // Add a short delay to ensure state is committed
    await new Promise(res => setTimeout(res, 100));

    const candidate1 = await votingProgram.account.candidate.fetch(
      PublicKey.findProgramAddressSync(
        [new anchor.BN(1).toArrayLike(Buffer, 'be', 8), Buffer.from("Smooth")],
        votingAddress
      )[0]
    );
    const candidate2 = await votingProgram.account.candidate.fetch(
      PublicKey.findProgramAddressSync(
        [new anchor.BN(1).toArrayLike(Buffer, 'be', 8), Buffer.from("Crunchy")],
        votingAddress
      )[0]
    );
    console.log(candidate1);
    expect(candidate1.candidateName).toEqual("Smooth");
    expect(candidate1.candidateVotes.toNumber()).toEqual(new anchor.BN(1).toNumber());
    console.log(candidate2);
    expect(candidate2.candidateName).toEqual("Crunchy");
    expect(candidate2.candidateVotes.toNumber()).toEqual(new anchor.BN(0).toNumber());
  }
  );
});


