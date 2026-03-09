import verifyHandler from '../../billing/verify';

export default async function handler(req, res) {
  req.query.reference = req.query.reference;
  return verifyHandler(req, res);
}
