class ServerData {
  constructor(server) {
    this.server = server;

    this.server.data = {};
  }


  loadData() {
    this.server.data.users = JSON.parse(this.server.FS.readFileSync(process.cwd() + '/server_data/users.json', 'utf8'));
  }

  saveDataUsers() {
    this.server.FS.writeFileSync(process.cwd() + '/server_data/users.json', JSON.stringify(this.server.data.users, null, 2));
  }

  addUser(id) {
    this.server.data.users.push({
      id,
      isMember: true,
      isNotif: false,
      isActive: false,
      isBanned: false,
      isAdmin: false,
      phoneNumber: null,
      mlbbAccounts: []
    });

    this.saveDataUsers();
  }

  getUsers() {
    return this.server.data.users;
  }
  
  addPhoneNumber(id, phoneNumber) {
    const index = this.server.data.users.findIndex(user => user.id === id);
    this.server.data.users[index].phoneNumber = phoneNumber;
    this.server.data.users[index].isNotif = true;

    this.saveDataUsers();
  }

  addMLBBAccount(id, mlbbId, mlbbServer) {
    const index = this.server.data.users.findIndex(user => user.id === id);
    this.server.data.users[index].mlbbAccounts.push({
      mlbbId,
      mlbbServer
    });

    this.saveDataUsers();
  }

  isMLLBBAccountExist(id, mlbbId, mlbbServer = null) {
    const index = this.server.data.users.findIndex(user => user.id === id);

    if(mlbbServer === null) {
      const mlbbAccount = this.server.data.users[index].mlbbAccounts.find(account => account.mlbbId === mlbbId);

      return mlbbAccount !== undefined;
    }

    const mlbbAccount = this.server.data.users[index].mlbbAccounts.find(account => account.mlbbId === mlbbId && account.mlbbServer === mlbbServer);

    return mlbbAccount !== undefined;
  }

  getUserCanCheckout() {
    // Check if user isMember === true, isNotif === true, isActive === true, isBanned === false, phoneNumber !== null, mlbbAccounts.length > 0.
    // And the return data only id, phoneNumber, and mlbbAccounts.
    return this.server.data.users.filter(user => user.isMember && user.isNotif && user.isActive && !user.isBanned && user.phoneNumber !== null && user.mlbbAccounts.length > 0).map(user => {
      return {
        id: user.id,
        phoneNumber: user.phoneNumber,
        mlbbAccounts: user.mlbbAccounts
      }
    });
  }

  deleteMLBBAccount(id, mlbbId) {
    const index = this.server.data.users.findIndex(user => user.id === id);
    const mlbbAccountIndex = this.server.data.users[index].mlbbAccounts.findIndex(account => account.mlbbId === mlbbId);

    this.server.data.users[index].mlbbAccounts.splice(mlbbAccountIndex, 1);

    this.saveDataUsers();
  }

  getUserById(id) {
    return this.server.data.users.find(user => user.id === id);
  }

  setUserIsActive(id, isActive) {
    const index = this.server.data.users.findIndex(user => user.id === id);
    this.server.data.users[index].isActive = isActive;
    
    this.saveDataUsers();
  }

  setUserAdmin(id) {
    const index = this.server.data.users.findIndex(user => user.id === id);
    this.server.data.users[index].isAdmin = true;

    this.saveDataUsers();
  }

  isUserAdmin(id) {
    const index = this.server.data.users.findIndex(user => user.id === id);

    return this.server.data.users[index].isAdmin;
  }
}

export default ServerData;