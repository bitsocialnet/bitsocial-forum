import type { Community } from '@bitsocial/bitsocial-react-hooks';
import useCommunitiesStore from '@bitsocial/bitsocial-react-hooks/dist/stores/communities/index.js';
import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

type CommunityLoadStatus = 'loaded' | 'loading' | 'retrying' | 'unreachable';
export type CommunitiesLoadStatus = Exclude<CommunityLoadStatus, 'loaded'>;

// pkc-js keeps polling a community after any load error, so its updatingState soon cycles back through
// 'fetching-ipns' and 'waiting-retry'. The hooks keep a community's non-retriable errors, such as an
// invalid record or a failed creation, until a record loads, but useCommunities only returns them
// flattened across communities, so they are read per community from the hooks' store.
function getCommunityLoadStatus(community: Community | undefined, errors: Error[] | undefined): CommunityLoadStatus {
  if (typeof community?.updatedAt === 'number') return 'loaded';
  if (errors?.length || community?.updatingState === 'failed') return 'unreachable';
  return community?.updatingState === 'waiting-retry' ? 'retrying' : 'loading';
}

// Why a feed of these communities is still empty while useFeed, which keeps hasMore true until every
// community has loaded, reports more topics to come: 'unreachable' once every community failed for good,
// 'retrying' once each of the others failed at least one load attempt, as an offline community does.
export function useCommunitiesLoadStatus(communityAddresses: string[]): CommunitiesLoadStatus {
  // useFeed adds the communities to the store under their address, the identifier's name or publicKey.
  // The store is a zustand hook, named as one so the React Compiler never memoizes the subscription away.
  const statuses = useCommunitiesStore(
    useShallow((state) => communityAddresses.map((address) => getCommunityLoadStatus(state.communities[address], state.errors[address]))),
  );
  // Retriable errors are not kept and 'waiting-retry' only lasts until the next attempt, so remember for
  // as long as this is mounted which never-loaded communities failed an attempt, instead of flickering.
  const [retriedAddresses, setRetriedAddresses] = useState<ReadonlySet<string>>(() => new Set());
  const newlyRetriedAddresses = communityAddresses.filter((address, index) => statuses[index] === 'retrying' && !retriedAddresses.has(address));
  if (newlyRetriedAddresses.length > 0) {
    setRetriedAddresses(new Set([...retriedAddresses, ...newlyRetriedAddresses]));
  }
  const currentStatuses = statuses.map((status, index) => (status === 'loading' && retriedAddresses.has(communityAddresses[index]) ? 'retrying' : status));

  if (currentStatuses.length > 0 && currentStatuses.every((status) => status === 'unreachable')) return 'unreachable';
  if (currentStatuses.length > 0 && currentStatuses.every((status) => status === 'unreachable' || status === 'retrying')) return 'retrying';
  return 'loading';
}
