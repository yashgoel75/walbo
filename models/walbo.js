import mongoose, { mongo } from 'mongoose';

const contactSchema = new mongoose.Schema({
  walboId: {
    type: String,
    required: false,
  },
  publicKey: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

const transactionHistorySchema = new mongoose.Schema({
  to: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  }
}, { timestamps: true });

const walboSchema = new mongoose.Schema({
  walboId: {
    type: String,
    required: true,
    unique: true,
  },
  walletAddress: {
    type: String,
      required: true,
    unique: true,
    // validate: {
    //   validator: function(v) {
    //     return /^(0x)?[0-9a-fA-F]{40}$/.test(v);
    //   },
    //   message: 'Invalid wallet address format!',
    // },
  },
  contacts: [contactSchema],
  transactionHistory: [transactionHistorySchema],
});

const Walbo = mongoose.models.Walbo || mongoose.model('Walbo', walboSchema);

export default Walbo;
