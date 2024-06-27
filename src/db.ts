/* eslint-disable prettier/prettier */
/* eslint-disable quotes */
import { enablePromise, openDatabase, SQLiteDatabase } from "react-native-sqlite-storage";

enablePromise(true);

const getDBConnection = async (): Promise<SQLiteDatabase> => {
  return openDatabase({ name: "FinanceBuddy" });
};

const createTables = async (db: SQLiteDatabase) => {
  await db.executeSql(
    `CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(20),
      type VARCHAR(20),
      budget REAL
    );`
  );

  await db.executeSql(
    `CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(20),
      balance REAL
    );`
  );

  await db.executeSql(
    `CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      accountId INTEGER,
      categoryId INTEGER,
      amount REAL,
      date DATETIME,
      FOREIGN KEY (accountId) REFERENCES accounts(id),
      FOREIGN KEY (categoryId) REFERENCES categories(id)
    );`
  );


  await db.executeSql(
    `CREATE TABLE IF NOT EXISTS transfers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fromAccountId INTEGER,
      toAccountId INTEGER,
      amount REAL,
      date DATETIME,
      FOREIGN KEY (fromAccountId) REFERENCES accounts(id),
      FOREIGN KEY (toAccountId) REFERENCES accounts(id)
    );`
  );
};

export { getDBConnection, createTables };
