module.exports.validateNewUser = ({ email, password, display_name }) => {
  let errors = {};
  let regex = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
  if (!email.match(regex)) {
    errors.email = "Email must be a valid email";
  }
  if (display_name.trim() === "") {
    errors.user_name = "please input a display name";
  }
  if (password.trim().length < 6) {
    errors.password = "Password must be longer than 6 characters";
  }
  let valid = Object.keys(errors).length < 1;
  return {
    errors,
    valid,
  };
};

module.exports.validateLogIn = ({ email, password }) => {
  errors = {};
  let regex = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
  if (!email.match(regex)) {
    errors.email = "Email must be a valid email";
  }
  if (password.trim().length < 1) {
    errors.password = "Password is required";
  }
  let valid = Object.keys(errors).length < 1;
  return {
    errors,
    valid,
  };
};

module.exports.getProjectAuthStatus = (token, project) => {
  let status = {};
  status.valid = false;
  status.role = "";
  let id = token.id;
  let email = token.email;
  isOwner = project.owner.toHexString() === id;
  isAdmin = project.admins.includes(id);
  isGuest = project.guests.includes(email);
  if (isGuest) {
    status.valid = true;
    status.role = "Guest";
  }
  if (isAdmin) {
    status.valid = true;
    status.role = "Admin";
  }
  if (isOwner) {
    status.valid = true;
    status.role = "Owner";
  }
  return status;
};
