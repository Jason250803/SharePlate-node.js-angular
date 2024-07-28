const app = require('./app');

const port = process.env.PORT || 2995;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
