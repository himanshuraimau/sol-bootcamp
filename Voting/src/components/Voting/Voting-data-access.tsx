'use client'

import { getVotingProgram, getVotingProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'

export function useVotingProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getVotingProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getVotingProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['Voting', 'all', { cluster }],
    queryFn: () => program.account.Voting.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['Voting', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ Voting: keypair.publicKey }).signers([keypair]).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  }
}

export function useVotingProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useVotingProgram()

  const accountQuery = useQuery({
    queryKey: ['Voting', 'fetch', { cluster, account }],
    queryFn: () => program.account.Voting.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['Voting', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ Voting: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['Voting', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ Voting: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['Voting', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ Voting: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['Voting', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ Voting: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}
