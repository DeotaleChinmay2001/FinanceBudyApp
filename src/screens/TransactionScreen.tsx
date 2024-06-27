/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable radix */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import {
  Transaction,
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from '../service/transactionService';
import {getCategories} from '../service/categoryService';
import {getAccounts} from '../service/accountService';
import {createTables, getDBConnection} from '../db';

const TransactionScreen: React.FC = () => {
  const [transactionId, setTransactionId] = useState<number | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<{id: number; name: string}[]>(
    [],
  );
  const [accounts, setAccounts] = useState<{id: number; name: string}[]>([]);
  const [accountFocus, setAccountFocus] = useState(false);
  const [categoryFocus, setCategoryFocus] = useState(false);

  useEffect(() => {
    const initDb = async () => {
      const db = await getDBConnection();
      await createTables(db);
      loadTransactions();
      loadCategories();
      loadAccounts();
    };
    initDb();
  }, []);

  const loadTransactions = async () => {
    const transactions = await getTransactions();
    setTransactions(transactions);
  };

  const loadCategories = async () => {
    const categories = await getCategories();
    console.log(categories);
    setCategories(categories);
  };

  const loadAccounts = async () => {
    const accounts = await getAccounts();
    console.log(accounts);
    setAccounts(accounts);
  };

  const handleAddOrUpdateTransaction = async () => {
    if (!accountId || !categoryId || !amount || !date) {
      Alert.alert('Please fill all fields');
      return;
    }
    if (transactionId !== null) {
      await updateTransaction(
        transactionId,
        parseInt(accountId),
        parseInt(categoryId),
        parseFloat(amount),
        date,
      );
    } else {
      await addTransaction(
        parseInt(accountId),
        parseInt(categoryId),
        parseFloat(amount),
        date,
      );
    }
    loadTransactions();
    setTransactionId(null);
    setAccountId(null);
    setCategoryId(null);
    setAmount('');
    setDate('');
  };

  const handleEditTransaction = (
    id: number,
    accountId: number,
    categoryId: number,
    amount: number,
    date: string,
  ) => {
    setTransactionId(id);
    setAccountId(accountId.toString());
    setCategoryId(categoryId.toString());
    setAmount(amount.toString());
    setDate(date);
  };

  const handleDeleteTransaction = async (id: number) => {
    await deleteTransaction(id);
    loadTransactions();
  };

  const renderTransaction = ({item}: {item: Transaction}) => (
    <View style={styles.transactionItem}>
      <Text>ID: {item.id}</Text>
      <Text>
        Account: {accounts.find(acc => acc.id === item.accountId)?.name}
      </Text>
      <Text>
        Category: {categories.find(cat => cat.id === item.categoryId)?.name}
      </Text>
      <Text>Amount: {item.amount}</Text>
      <Text>Date: {item.date}</Text>
      <Button
        title="Edit"
        onPress={() =>
          handleEditTransaction(
            item.id,
            item.accountId,
            item.categoryId,
            item.amount,
            item.date,
          )
        }
      />
      <Button title="Delete" onPress={() => handleDeleteTransaction(item.id)} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transactions</Text>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Enter amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          style={styles.input}
        />
        <TextInput
          placeholder="Enter date (YYYY-MM-DD)"
          value={date}
          onChangeText={setDate}
          style={styles.input}
        />

        {/* Dropdown for Account */}
        <Dropdown
          style={[styles.dropdown, accountFocus && {borderColor: 'blue'}]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={accounts.map(acc => ({
            label: acc.name,
            value: acc.id.toString(),
          }))}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!accountFocus ? 'Select account' : '...'}
          searchPlaceholder="Search..."
          value={accountId}
          onFocus={() => setAccountFocus(true)}
          onBlur={() => setAccountFocus(false)}
          onChange={(item: {value: React.SetStateAction<string | null>}) => {
            setAccountId(item.value);
            setAccountFocus(false);
          }}
        />

        {/* Dropdown for Category */}
        <Dropdown
          style={[styles.dropdown, categoryFocus && {borderColor: 'blue'}]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={categories.map(cat => ({
            label: cat.name,
            value: cat.id.toString(),
          }))}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!categoryFocus ? 'Select category' : '...'}
          searchPlaceholder="Search..."
          value={categoryId}
          onFocus={() => setCategoryFocus(true)}
          onBlur={() => setCategoryFocus(false)}
          onChange={(item: {value: React.SetStateAction<string | null>}) => {
            setCategoryId(item.value);
            setCategoryFocus(false);
          }}
        />

        <Button
          title={transactionId !== null ? 'Update' : 'Submit'}
          onPress={handleAddOrUpdateTransaction}
        />
      </View>

      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={item => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  icon: {
    marginRight: 5,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  transactionItem: {
    flexDirection: 'column',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
});

export default TransactionScreen;
