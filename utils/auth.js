import bcrypt from "bcrypt";

export const hashPassword = (password) => {
  //hashing the password
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(12, (err, salt) => {
      if (err) {
        reject(err);
      }
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          reject(err);
        }
        resolve(hash);
      });
    });
  });
};

export const comparePassword = (password, hashPassword) => {
  //comparing the password and hashed password
  return bcrypt.compare(password, hashPassword);
};
