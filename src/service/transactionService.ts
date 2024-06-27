/* eslint-disable prettier/prettier */
import { getDBConnection } from '../db';

interface Transaction {
  id: number;
  accountId: number;
  categoryId: number;
  amount: number;
  date: string;
}

interface Category {
  id: number;
  name: string;
  type: string;
  budget: number;
}

const getTransactions = async (): Promise<Transaction[]> => {
  const db = await getDBConnection();
  const transactions: Transaction[] = [];
  const results = await db.executeSql(
    `SELECT t.id, t.accountId, t.categoryId, t.amount, t.date, c.name AS categoryName, a.name AS accountName
     FROM transactions t
     LEFT JOIN categories c ON t.categoryId = c.id
     LEFT JOIN accounts a ON t.accountId = a.id
     ORDER BY t.id DESC`,
  );
  results.forEach(result => {
    for (let index = 0; index < result.rows.length; index++) {
      const item = result.rows.item(index);
      transactions.push({
        id: item.id,
        accountId: item.accountId,
        categoryId: item.categoryId,
        amount: item.amount,
        date: item.date,
      });
    }
  });
  return transactions;
};

const getTransactionsByDate = async (date: string): Promise<Transaction[]> => {
  const db = await getDBConnection();
  const transactions: Transaction[] = [];
  const results = await db.executeSql(
    `SELECT t.id, t.accountId, t.categoryId, t.amount, t.date, c.name AS categoryName, a.name AS accountName
     FROM transactions t
     LEFT JOIN categories c ON t.categoryId = c.id
     LEFT JOIN accounts a ON t.accountId = a.id
     WHERE DATE(t.date) = DATE(?)
     ORDER BY t.id DESC`,
    [date]
  );
  results.forEach(result => {
    for (let index = 0; index < result.rows.length; index++) {
      const item = result.rows.item(index);
      transactions.push({
        id: item.id,
        accountId: item.accountId,
        categoryId: item.categoryId,
        amount: item.amount,
        date: item.date,
      });
    }
  });
  return transactions;
};

const getTransactionsByMonth = async (month: string): Promise<Transaction[]> => {
  const db = await getDBConnection();
  const transactions: Transaction[] = [];
  const results = await db.executeSql(
    `SELECT t.id, t.accountId, t.categoryId, t.amount, t.date, c.name AS categoryName, a.name AS accountName
     FROM transactions t
     LEFT JOIN categories c ON t.categoryId = c.id
     LEFT JOIN accounts a ON t.accountId = a.id
     WHERE strftime('%Y-%m', t.date) = ?
     ORDER BY t.id DESC`,
    [month]
  );
  results.forEach(result => {
    for (let index = 0; index < result.rows.length; index++) {
      const item = result.rows.item(index);
      transactions.push({
        id: item.id,
        accountId: item.accountId,
        categoryId: item.categoryId,
        amount: item.amount,
        date: item.date,
      });
    }
  });
  return transactions;
};

const getTransactionsByYear = async (year: string): Promise<Transaction[]> => {
  const db = await getDBConnection();
  const transactions: Transaction[] = [];
  const results = await db.executeSql(
    `SELECT t.id, t.accountId, t.categoryId, t.amount, t.date, c.name AS categoryName, a.name AS accountName
     FROM transactions t
     LEFT JOIN categories c ON t.categoryId = c.id
     LEFT JOIN accounts a ON t.accountId = a.id
     WHERE strftime('%Y', t.date) = ?
     ORDER BY t.id DESC`,
    [year]
  );
  results.forEach(result => {
    for (let index = 0; index < result.rows.length; index++) {
      const item = result.rows.item(index);
      transactions.push({
        id: item.id,
        accountId: item.accountId,
        categoryId: item.categoryId,
        amount: item.amount,
        date: item.date,
      });
    }
  });
  return transactions;
};

const addTransaction = async (
  accountId: number,
  categoryId: number,
  amount: number,
  date: string,
) => {
  const db = await getDBConnection();

  // Get category to determine if it's income or expense
  const categoryResults = await db.executeSql('SELECT * FROM categories WHERE id = ?', [categoryId]);
  if (categoryResults[0].rows.length === 0) {
    throw new Error('Category not found');
  }
  const category: Category = categoryResults[0].rows.item(0);
  
  // Update the account balance
  const accountResults = await db.executeSql('SELECT * FROM accounts WHERE id = ?', [accountId]);
  if (accountResults[0].rows.length === 0) {
    throw new Error('Account not found');
  }
  const account = accountResults[0].rows.item(0);
  const newBalance = category.type === 'income' ? account.balance + amount : account.balance - amount;
  await db.executeSql('UPDATE accounts SET balance = ? WHERE id = ?', [newBalance, accountId]);

  // Add the transaction
  await db.executeSql(
    'INSERT INTO transactions (accountId, categoryId, amount, date) VALUES (?, ?, ?, ?)',
    [accountId, categoryId, amount, date],
  );
};

const updateTransaction = async (
  id: number,
  accountId: number,
  categoryId: number,
  amount: number,
  date: string,
) => {
  const db = await getDBConnection();

  // Get the previous transaction details
  const transactionResults = await db.executeSql('SELECT * FROM transactions WHERE id = ?', [id]);
  if (transactionResults[0].rows.length === 0) {
    throw new Error('Transaction not found');
  }
  const previousTransaction: Transaction = transactionResults[0].rows.item(0);

  // Get category to determine if it's income or expense
  const categoryResults = await db.executeSql('SELECT * FROM categories WHERE id = ?', [categoryId]);
  if (categoryResults[0].rows.length === 0) {
    throw new Error('Category not found');
  }
  const category: Category = categoryResults[0].rows.item(0);

  // Update the account balance
  const accountResults = await db.executeSql('SELECT * FROM accounts WHERE id = ?', [accountId]);
  if (accountResults[0].rows.length === 0) {
    throw new Error('Account not found');
  }
  const account = accountResults[0].rows.item(0);

  const previousBalance = category.type === 'income' ? account.balance - previousTransaction.amount : account.balance + previousTransaction.amount;
  const newBalance = category.type === 'income' ? previousBalance + amount : previousBalance - amount;
  
  await db.executeSql('UPDATE accounts SET balance = ? WHERE id = ?', [newBalance, accountId]);

  // Update the transaction
  await db.executeSql(
    'UPDATE transactions SET accountId = ?, categoryId = ?, amount = ?, date = ? WHERE id = ?',
    [accountId, categoryId, amount, date, id],
  );
};

const deleteTransaction = async (id: number) => {
  const db = await getDBConnection();

  // Get the transaction details
  const transactionResults = await db.executeSql('SELECT * FROM transactions WHERE id = ?', [id]);
  if (transactionResults[0].rows.length === 0) {
    throw new Error('Transaction not found');
  }
  const transaction: Transaction = transactionResults[0].rows.item(0);

  // Get category to determine if it's income or expense
  const categoryResults = await db.executeSql('SELECT * FROM categories WHERE id = ?', [transaction.categoryId]);
  if (categoryResults[0].rows.length === 0) {
    throw new Error('Category not found');
  }
  const category: Category = categoryResults[0].rows.item(0);

  // Update the account balance
  const accountResults = await db.executeSql('SELECT * FROM accounts WHERE id = ?', [transaction.accountId]);
  if (accountResults[0].rows.length === 0) {
    throw new Error('Account not found');
  }
  const account = accountResults[0].rows.item(0);

  const newBalance = category.type === 'income' ? account.balance - transaction.amount : account.balance + transaction.amount;
  
  await db.executeSql('UPDATE accounts SET balance = ? WHERE id = ?', [newBalance, transaction.accountId]);

  // Delete the transaction
  await db.executeSql('DELETE FROM transactions WHERE id = ?', [id]);
};

export { getTransactions, getTransactionsByDate, getTransactionsByMonth, getTransactionsByYear, addTransaction, updateTransaction, deleteTransaction };
export type { Transaction };
