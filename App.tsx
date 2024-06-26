import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {
  createTable,
  addCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from './database';

interface Category {
  id: number;
  categoryName: string;
  type: string;
  budget: number;
}

const App: React.FC = () => {
  const [categoryName, setCategoryName] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [budget, setBudget] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    createTable();
    loadCategories();
  }, []);

  const loadCategories = () => {
    getCategories(setCategories);
  };

  const handleAddCategory = () => {
    if (editingCategory) {
      updateCategory(
        editingCategory.id,
        categoryName,
        type,
        parseFloat(budget),
      );
    } else {
      addCategory(categoryName, type, parseFloat(budget));
    }
    setCategoryName('');
    setType('');
    setBudget('');
    setEditingCategory(null);
    loadCategories();
  };

  const handleEditCategory = (category: Category) => {
    setCategoryName(category.categoryName);
    setType(category.type);
    setBudget(category.budget.toString());
    setEditingCategory(category);
  };

  const handleDeleteCategory = (id: number) => {
    deleteCategory(id);
    loadCategories();
  };

  const renderItem = ({item}: {item: Category}) => (
    <View style={styles.categoryItem}>
      <Text>{item.categoryName}</Text>
      <Text>{item.type}</Text>
      <Text>{item.budget}</Text>
      <TouchableOpacity onPress={() => handleEditCategory(item)}>
        <Text>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleDeleteCategory(item.id)}>
        <Text>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        placeholder="Category Name"
        value={categoryName}
        onChangeText={setCategoryName}
        style={styles.input}
      />
      <TextInput
        placeholder="Type"
        value={type}
        onChangeText={setType}
        style={styles.input}
      />
      <TextInput
        placeholder="Budget"
        value={budget}
        onChangeText={setBudget}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button
        title={editingCategory ? 'Update Category' : 'Add Category'}
        onPress={handleAddCategory}
      />
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default App;
