// Simple in-memory users model (replace with MongoDB model later)
const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
];

export function listUsers() {
  return users;
}

export function addUser(user) {
  const id = users.length ? users[users.length - 1].id + 1 : 1;
  const newUser = { id, ...user };
  users.push(newUser);
  return newUser;
}
