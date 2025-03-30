export const useVoteCalculator = (votes) => {
  const votesForCreator = computed(() => {
    return votes.data.filter((vote) => {
      return vote.attributes.for === "creator";
    }).length;
  });

  const votesForOpponent = computed(() => {
    return votes.data.filter((vote) => {
      return vote.attributes.for === "opponent";
    }).length;
  });

  const calculateVotePercentage = (creatorVotes, opponentVotes) => {
    const totalVotes = creatorVotes + opponentVotes;

    if (totalVotes === 0) {
      return {
        creatorPercentage: 50,
        opponentPercentage: 50,
      };
    }

    const creatorPercentage = (creatorVotes / totalVotes) * 100;
    const opponentPercentage = (opponentVotes / totalVotes) * 100;

    return {
      creatorPercentage: Math.round(creatorPercentage),
      opponentPercentage: Math.round(opponentPercentage),
    };
  };

  const { creatorPercentage, opponentPercentage } = calculateVotePercentage(
    votesForCreator.value,
    votesForOpponent.value
  );
  return {
    creatorPercentage,
    opponentPercentage,
    votesForCreator,
    votesForOpponent,
  };
};
