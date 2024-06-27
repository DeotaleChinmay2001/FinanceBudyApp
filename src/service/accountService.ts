/* eslint-disable prettier/prettier */
import { getDBConnection } from '../db';

interface Account {
  id: number;
  name: string;
  balance: number;
}

const getAccounts = async (): Promise<Account[]> => {
  const db = await getDBConnection();
  const accounts: Account[] = [];
  const results = await db.executeSql('SELECT * FROM accounts ORDER BY id DESC');
  results.forEach(result => {
    for (let index = 0; index < result.rows.length; index++) {
      accounts.push(result.rows.item(index));
    }
  });
  return accounts;
};

const addAccount = async (name: string, balance: number) => {
  const db = await getDBConnection();
  await db.executeSql('INSERT INTO accounts (name, balance) VALUES (?, ?)', [name, balance]);
};

const updateAccount = async (id: number, name: string, balance: number) => {
  const db = await getDBConnection();
  await db.executeSql('UPDATE accounts SET name = ?, balance = ? WHERE id = ?', [name, balance, id]);
};

const deleteAccount = async (id: number) => {
  const db = await getDBConnection();
  await db.executeSql('DELETE FROM accounts WHERE id = ?', [id]);
};



export { getAccounts, addAccount, updateAccount, deleteAccount };    export type { Account };

