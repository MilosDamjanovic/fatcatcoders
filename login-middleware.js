module.exports = (req, res, next) => {
  if (req.method == 'POST' && req.path == '/login') {
    if (req.body.email !== '' && req.body.password !== '') {
      res.status(200).json({...req.body})
    } else {
      res.status(404).json({ message: 'User not Found' })
    }
  } else {
    next()
  }
}
