const Address = require("../models/Address");

const getAddresses = async (req, res) => {
  const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
  res.json(addresses);
};

const addAddress = async (req, res) => {
  const { type, street, city, state, zipCode, phone, isDefault } = req.body;

  if (!street || !city || !state || !zipCode || !phone) {
    return res.status(400).json({ message: "All address fields are required" });
  }

  // If this is the first address, make it default
  const addressCount = await Address.countDocuments({ user: req.user._id });
  const shouldBeDefault = addressCount === 0 ? true : isDefault;

  if (shouldBeDefault) {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
  }

  const address = await Address.create({
    user: req.user._id,
    type,
    street,
    city,
    state,
    zipCode,
    phone,
    isDefault: shouldBeDefault,
  });

  res.status(201).json(address);
};

const updateAddress = async (req, res) => {
  const { type, street, city, state, zipCode, phone, isDefault } = req.body;
  const address = await Address.findOne({ _id: req.params.id, user: req.user._id });

  if (!address) {
    return res.status(404).json({ message: "Address not found" });
  }

  if (isDefault && !address.isDefault) {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
    address.isDefault = true;
  } else if (isDefault === false && address.isDefault) {
    // Cannot unset default unless there are other addresses, in which case we make another one default
    const otherAddress = await Address.findOne({ user: req.user._id, _id: { $ne: address._id } });
    if (otherAddress) {
      otherAddress.isDefault = true;
      await otherAddress.save();
      address.isDefault = false;
    }
  }

  if (type) address.type = type;
  if (street) address.street = street;
  if (city) address.city = city;
  if (state) address.state = state;
  if (zipCode) address.zipCode = zipCode;
  if (phone) address.phone = phone;

  await address.save();
  res.json(address);
};

const deleteAddress = async (req, res) => {
  const address = await Address.findOne({ _id: req.params.id, user: req.user._id });

  if (!address) {
    return res.status(404).json({ message: "Address not found" });
  }

  const wasDefault = address.isDefault;
  await Address.deleteOne({ _id: req.params.id });

  if (wasDefault) {
    const otherAddress = await Address.findOne({ user: req.user._id });
    if (otherAddress) {
      otherAddress.isDefault = true;
      await otherAddress.save();
    }
  }

  res.json({ message: "Address deleted successfully" });
};

module.exports = {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
};
