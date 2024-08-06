module.exports = async (ctx, next) => {
  const { id } = ctx.state.user; // Get the user ID from the authenticated user#

  // Check if the requested user ID is the same as the authenticated user's ID
  if (ctx.params.id && ctx.params.id.toString() === id.toString()) {
    // If accessing their own profile, allow access to all fields
    return await next();
  } else {
    // If accessing another user's profile, restrict access to sensitive fields
    ctx.request.body = {}; // Clear request body to prevent access to sensitive data
    return await next();
  }
};
