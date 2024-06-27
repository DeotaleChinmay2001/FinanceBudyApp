/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {View, Text, TextInput, Button, FlatList, Alert} from 'react-native';
import {
  Account,
  getAccounts,
  addAccount,
  updateAccount,
  deleteAccount,
} from '../service/accountService';
import {createTables, getDBConnection} from '../db';

const AccountScreen: React.FC = () => {
  const [accountId, setAccountId] = useState<number | null>(null);
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    const initDb = async () => {
      const db = await getDBConnection();
      await createTables(db);
      loadAccounts();
    };
    initDb();
  }, []);

  const loadAccounts = async () => {
    const accounts = await getAccounts();
    setAccounts(accounts);
  };

  const handleAddOrUpdateAccount = async () => {
    if (!account || !balance) {
      Alert.alert('Please fill all fields');
      return;
    }
    if (accountId !== null) {
      await updateAccount(accountId, account, parseFloat(balance));
    } else {
      await addAccount(account, parseFloat(balance));
    }
    loadAccounts();
    setAccountId(null);
    setAccount('');
    setBalance('');
  };

  const handleEditAccount = (id: number, name: string, balance: number) => {
    setAccountId(id);
    setAccount(name);
    setBalance(balance.toString());
  };

  const handleDeleteAccount = async (id: number) => {
    await deleteAccount(id);
    loadAccounts();
  };

  const renderAccount = ({item}: {item: Account}) => (
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
      <Text style={{marginRight: 9}}>{item.balance}</Text>
      <Button
        title="Edit"
        onPress={() => handleEditAccount(item.id, item.name, item.balance)}
      />
      <Button title="Delete" onPress={() => handleDeleteAccount(item.id)} />
    </View>
  );

  return (
    <View>
      <TextInput
        placeholder="Enter account name"
        value={account}
        onChangeText={setAccount}
        style={{marginHorizontal: 8}}
      />
      <TextInput
        placeholder="Enter balance"
        value={balance}
        onChangeText={setBalance}
        keyboardType="numeric"
        style={{marginHorizontal: 8}}
      />
      <Button
        title={accountId !== null ? 'Update' : 'Submit'}
        onPress={handleAddOrUpdateAccount}
      />
      <FlatList
        data={accounts}
        renderItem={renderAccount}
        keyExtractor={item => item.id.toString()}
      />
    </View>
  );
};

export default AccountScreen;
