
module.exports = (fn) => {
  // Export a function that accepts another function as an argument
  return (req, res, next) => {
    // Return a new function that takes req, res, and next as parameters
    fn(req, res, next).catch(next); // Call the provided function with req, res, and next, and catch any errors
  };
};
