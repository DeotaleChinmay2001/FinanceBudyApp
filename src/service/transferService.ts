/* eslint-disable prettier/prettier */
import { getDBConnection } from '../db';

interface Account {
  id: number;
  name: string;
  balance: number;
}


interface Transfer {
  id: number;
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  date: string;
}

const getTransfers = async (): Promise<Transfer[]> => {
  const db = await getDBConnection();
  const transfers: Transfer[] = [];
  const results = await db.executeSql('SELECT * FROM transfers ORDER BY id DESC');
  results.forEach(result => {
    for (let index = 0; index < result.rows.length; index++) {
      transfers.push(result.rows.item(index));
    }
  });
  return transfers;
};

const addTransfer = async (fromAccountId: number, toAccountId: number, amount: number) => {
  const db = await getDBConnection();
  const fromAccount = await getAccountById(fromAccountId);
  const toAccount = await getAccountById(toAccountId);

  if (!fromAccount || !toAccount) {
    throw new Error('One or both accounts do not exist.');
  }

  if (fromAccount.balance < amount) {
    throw new Error('Insufficient balance in the source account.');
  }

  try {
    await db.transaction(async () => {
      // Deduct amount from source account
      await db.executeSql(
        'UPDATE accounts SET balance = balance - ? WHERE id = ?',
        [amount, fromAccountId]
      );

      // Add amount to destination account
      await db.executeSql(
        'UPDATE accounts SET balance = balance + ? WHERE id = ?',
        [amount, toAccountId]
      );

      // Record the transfer
      const date = new Date().toISOString();
      await db.executeSql(
        'INSERT INTO transfers (fromAccountId, toAccountId, amount, date) VALUES (?, ?, ?, ?)',
        [fromAccountId, toAccountId, amount, date]
      );
    });
  } catch (error) {
    throw new Error('Failed to add transfer: ' + error);
  }
};

const editTransfer = async (transferId: number, fromAccountId: number, toAccountId: number, amount: number) => {
  const db = await getDBConnection();
  const currentTransfer = await getTransferById(transferId);

  if (!currentTransfer) {
    throw new Error('Transfer not found.');
  }

  const oldAmount = currentTransfer.amount;

  try {
    await db.transaction(async () => {
      // Adjust account balances for the original amounts
      await db.executeSql(
        'UPDATE accounts SET balance = balance + ? WHERE id = ?',
        [oldAmount, fromAccountId]
      );
      await db.executeSql(
        'UPDATE accounts SET balance = balance - ? WHERE id = ?',
        [oldAmount, toAccountId]
      );

      // Deduct new amount from source account
      await db.executeSql(
        'UPDATE accounts SET balance = balance - ? WHERE id = ?',
        [amount, fromAccountId]
      );

      // Add new amount to destination account
      await db.executeSql(
        'UPDATE accounts SET balance = balance + ? WHERE id = ?',
        [amount, toAccountId]
      );

      // Update the transfer
      await db.executeSql(
        'UPDATE transfers SET fromAccountId = ?, toAccountId = ?, amount = ? WHERE id = ?',
        [fromAccountId, toAccountId, amount, transferId]
      );
    });
  } catch (error) {
    throw new Error('Failed to edit transfer: ' + error);
  }
};

const deleteTransfer = async (transferId: number) => {
  const db = await getDBConnection();
  const currentTransfer = await getTransferById(transferId);

  if (!currentTransfer) {
    throw new Error('Transfer not found.');
  }

  try {
    await db.transaction(async () => {
      // Restore account balances
      await db.executeSql(
        'UPDATE accounts SET balance = balance + ? WHERE id = ?',
        [currentTransfer.amount, currentTransfer.fromAccountId]
      );
      await db.executeSql(
        'UPDATE accounts SET balance = balance - ? WHERE id = ?',
        [currentTransfer.amount, currentTransfer.toAccountId]
      );

      // Delete the transfer
      await db.executeSql('DELETE FROM transfers WHERE id = ?', [transferId]);
    });
  } catch (error) {
    throw new Error('Failed to delete transfer: ' + error);
  }
};

const getTransferById = async (transferId: number): Promise<Transfer | null> => {
  const db = await getDBConnection();
  try {
    const results = await db.executeSql('SELECT * FROM transfers WHERE id = ?', [transferId]);

    if (results[0].rows.length > 0) {
      const transfer = results[0].rows.item(0);
      return {
        id: transfer.id,
        fromAccountId: transfer.fromAccountId,
        toAccountId: transfer.toAccountId,
        amount: transfer.amount,
        date: transfer.date,
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching transfer by ID:', error);
    return null;
  }
};

const getAccountById = async (accountId: number): Promise<Account | null> => {
  const db = await getDBConnection();
  try {
    const results = await db.executeSql('SELECT * FROM accounts WHERE id = ?', [accountId]);

    if (results[0].rows.length > 0) {
      const account = results[0].rows.item(0);
      return {
        id: account.id,
        name: account.name,
        balance: account.balance,
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching account by ID:', error);
    return null;
  }
};

export { getTransfers, addTransfer, editTransfer, deleteTransfer };
export type { Transfer };
