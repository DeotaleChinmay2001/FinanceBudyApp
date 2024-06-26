/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable quotes */
import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase(
  {
    name: 'CategoryDB',
    location: 'default',
  },
  () => {},
  error => {
    console.log(error);
  }
);

export const createTable = (): void => {
  db.transaction(txn => {
    txn.executeSql(
      `CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, categoryName TEXT, type TEXT, budget REAL)`,
      [],
      (sqlTxn, res) => {
        console.log('Table created successfully');
      },
      error => {
        console.log('Error on creating table ' + error);
      }
    );
  });
};

export const addCategory = (categoryName: string, type: string, budget: number): void => {
  db.transaction(txn => {
    txn.executeSql(
      `INSERT INTO categories (categoryName, type, budget) VALUES (?,?,?)`,
      [categoryName, type, budget],
      (sqlTxn, res) => {
        console.log(`Category added successfully`);
      },
      error => {
        console.log('Error on adding category ' + error);
      }
    );
  });
};

export const getCategories = (callback: (categories: any[]) => void): void => {
  db.transaction(txn => {
    txn.executeSql(
      `SELECT * FROM categories`,
      [],
      (sqlTxn, res) => {
        console.log('Categories retrieved successfully');
        let len = res.rows.length;
        if (len > 0) {
          let results: any[] = [];
          for (let i = 0; i < len; i++) {
            let item = res.rows.item(i);
            results.push(item);
          }
          callback(results);
        }
      },
      error => {
        console.log('Error on retrieving categories ' + error);
      }
    );
  });
};

export const updateCategory = (id: number, categoryName: string, type: string, budget: number): void => {
  db.transaction(txn => {
    txn.executeSql(
      `UPDATE categories SET categoryName = ?, type = ?, budget = ? WHERE id = ?`,
      [categoryName, type, budget, id],
      (sqlTxn, res) => {
        console.log('Category updated successfully');
      },
      error => {
        console.log('Error on updating category ' + error);
      }
    );
  });
};

export const deleteCategory = (id: number): void => {
  db.transaction(txn => {
    txn.executeSql(
      `DELETE FROM categories WHERE id = ?`,
      [id],
      (sqlTxn, res) => {
        console.log('Category deleted successfully');
      },
      error => {
        console.log('Error on deleting category ' + error);
      }
    );
  });
};
