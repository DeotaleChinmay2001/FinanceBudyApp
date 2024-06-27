/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {View, Text, TextInput, Button, FlatList, Alert} from 'react-native';
import {
  Category,
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from '../service/categoryService';
import {createTables, getDBConnection} from '../db';

const CategoryScreen: React.FC = () => {
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [budget, setBudget] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const initDb = async () => {
      const db = await getDBConnection();
      await createTables(db);
      loadCategories();
    };
    initDb();
  }, []);

  const loadCategories = async () => {
    const categories = await getCategories();
    setCategories(categories);
  };

  const handleAddOrUpdateCategory = async () => {
    if (!category || !type || !budget) {
      Alert.alert('Please fill all fields');
      return;
    }
    if (categoryId !== null) {
      await updateCategory(categoryId, category, type, parseFloat(budget));
    } else {
      await addCategory(category, type, parseFloat(budget));
    }
    loadCategories();
    setCategoryId(null);
    setCategory('');
    setType('');
    setBudget('');
  };

  const handleEditCategory = (
    id: number,
    name: string,
    type: string,
    budget: number,
  ) => {
    setCategoryId(id);
    setCategory(name);
    setType(type);
    setBudget(budget.toString());
  };

  const handleDeleteCategory = async (id: number) => {
    await deleteCategory(id);
    loadCategories();
  };

  const renderCategory = ({item}: {item: Category}) => (
    <View
      style={{
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderColor: '#ddd',
      }}>
      <Text style={{marginRight: 9}}>{item.id}</Text>
      <Text style={{marginRight: 9}}>{item.name}</Text>
      <Text style={{marginRight: 9}}>{item.type}</Text>
      <Text style={{marginRight: 9}}>{item.budget}</Text>
      <Button
        title="Edit"
        onPress={() =>
          handleEditCategory(item.id, item.name, item.type, item.budget)
        }
      />
      <Button title="Delete" onPress={() => handleDeleteCategory(item.id)} />
    </View>
  );

  return (
    <View>
      <TextInput
        placeholder="Enter category"
        value={category}
        onChangeText={setCategory}
        style={{marginHorizontal: 8}}
      />
      <TextInput
        placeholder="Enter type (income/expense)"
        value={type}
        onChangeText={setType}
        style={{marginHorizontal: 8}}
      />
      <TextInput
        placeholder="Enter budget"
        value={budget}
        onChangeText={setBudget}
        keyboardType="numeric"
        style={{marginHorizontal: 8}}
      />
      <Button
        title={categoryId !== null ? 'Update' : 'Submit'}
        onPress={handleAddOrUpdateCategory}
      />
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={item => item.id.toString()}
      />
    </View>
  );
};

export default CategoryScreen;
