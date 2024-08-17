module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;
    const { castBy, argumentTree, for: votedFor } = data;
    console.log(castBy, argumentTree, votedFor);

    // Fetch the argument to check the creator
    const argumentDetails = await strapi.entityService.findOne(
      "api::argument-tree.argument-tree",
      argumentTree,
      {
        populate: { creator: true }, // Ensure the creator is populated
      }
    );

    if (!argumentDetails) {
      const error = new Error("Argument not found.");
      error.status = 404; // Not Found
      throw error;
    }

    // Prevent users from voting for their own argument
    if (argumentDetails.creator.id === castBy) {
      const error = new Error("You cannot vote for your own argument.");
      error.status = 403; // Forbidden
      throw error;
    }

    const existingVote = await strapi.entityService.findMany("api::vote.vote", {
      filters: {
        castBy,
        argumentTree,
        votedFor,
      },
    });

    if (existingVote.length > 0) {
      const error = new Error("User has already voted on this argument.");
      error.status = 409; // Set the HTTP status code
      throw error;
    }
  },
};
