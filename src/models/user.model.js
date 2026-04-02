const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Excluded from queries by default for security
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must be at most 100 characters'],
    },
    role: {
      type: String,
      required: true,
      enum: {
        values: ['admin', 'analyst', 'viewer'],
        message: 'Role must be one of: admin, analyst, viewer',
      },
      default: 'viewer',
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ['active', 'inactive'],
        message: 'Status must be one of: active, inactive',
      },
      default: 'active',
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);


// Remove sensitive fields when converting to JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.passwordHash;
  delete user.__v;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
