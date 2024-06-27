/* eslint-disable prettier/prettier */
import { getDBConnection } from '../db';

interface Category {
  id: number;
  name: string;
  type: string;
  budget: number;
}

const getCategories = async (): Promise<Category[]> => {
  const db = await getDBConnection();
  const categories: Category[] = [];
  const results = await db.executeSql('SELECT * FROM categories ORDER BY id DESC');
  results.forEach(result => {
    for (let index = 0; index < result.rows.length; index++) {
      categories.push(result.rows.item(index));
    }
  });
  return categories;
};

const addCategory = async (name: string, type: string, budget: number) => {
  const db = await getDBConnection();
  await db.executeSql('INSERT INTO categories (name, type, budget) VALUES (?, ?, ?)', [name, type, budget]);
};

const updateCategory = async (id: number, name: string, type: string, budget: number) => {
  const db = await getDBConnection();
  await db.executeSql('UPDATE categories SET name = ?, type = ?, budget = ? WHERE id = ?', [name, type, budget, id]);
};

const deleteCategory = async (id: number) => {
  const db = await getDBConnection();
  await db.executeSql('DELETE FROM categories WHERE id = ?', [id]);
};

export { getCategories, addCategory, updateCategory, deleteCategory };  export type { Category };

