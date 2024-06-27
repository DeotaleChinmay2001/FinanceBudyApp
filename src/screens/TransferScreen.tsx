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
  Transfer,
  getTransfers,
  addTransfer,
  editTransfer,
  deleteTransfer,
} from '../service/transferService';
import {getAccounts} from '../service/accountService';
import {getDBConnection, createTables} from '../db';

interface Account {
  id: number;
  name: string;
  balance: number;
}

const TransferScreen: React.FC = () => {
  const [transferId, setTransferId] = useState<number | null>(null);
  const [fromAccountId, setFromAccountId] = useState<string | null>(null);
  const [toAccountId, setToAccountId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [fromAccountFocus, setFromAccountFocus] = useState(false);
  const [toAccountFocus, setToAccountFocus] = useState(false);

  useEffect(() => {
    const initDb = async () => {
      const db = await getDBConnection();
      await createTables(db);
      loadTransfers();
      loadAccounts();
    };
    initDb();
  }, []);

  const loadTransfers = async () => {
    const loadedTransfers = await getTransfers();
    setTransfers(loadedTransfers);
  };

  const loadAccounts = async () => {
    const loadedAccounts = await getAccounts();
    setAccounts(loadedAccounts);
  };

  const handleAddOrUpdateTransfer = async () => {
    if (!fromAccountId || !toAccountId || !amount) {
      Alert.alert('Please fill all fields');
      return;
    }
    try {
      if (transferId !== null) {
        await editTransfer(
          transferId,
          parseInt(fromAccountId),
          parseInt(toAccountId),
          parseFloat(amount),
        );
      } else {
        await addTransfer(
          parseInt(fromAccountId),
          parseInt(toAccountId),
          parseFloat(amount),
        );
      }
      loadTransfers();
      setTransferId(null);
      setFromAccountId(null);
      setToAccountId(null);
      setAmount('');
    } catch (error) {
      Alert.alert('Error');
    }
  };

  const handleEditTransfer = (
    id: number,
    fromAccountId: number,
    toAccountId: number,
    amount: number,
  ) => {
    setTransferId(id);
    setFromAccountId(fromAccountId.toString());
    setToAccountId(toAccountId.toString());
    setAmount(amount.toString());
  };

  const handleDeleteTransfer = async (id: number) => {
    try {
      await deleteTransfer(id);
      loadTransfers();
    } catch (error) {
      Alert.alert('Error');
    }
  };

  const renderTransferItem = ({item}: {item: Transfer}) => (
    <View style={styles.transferItem}>
      <Text>ID: {item.id}</Text>
      <Text>
        From Account:{' '}
        {accounts.find(acc => acc.id === item.fromAccountId)?.name}
      </Text>
      <Text>
        To Account: {accounts.find(acc => acc.id === item.toAccountId)?.name}
      </Text>
      <Text>Amount: {item.amount}</Text>
      <Button
        title="Edit"
        onPress={() =>
          handleEditTransfer(
            item.id,
            item.fromAccountId,
            item.toAccountId,
            item.amount,
          )
        }
      />
      <Button
        title="Delete"
        onPress={() => handleDeleteTransfer(item.id)}
        color="red"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transfers</Text>

      <View style={styles.inputContainer}>
        {/* Dropdown for From Account */}
        <Dropdown
          style={[styles.dropdown, fromAccountFocus && {borderColor: 'blue'}]}
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
          placeholder={!fromAccountFocus ? 'Select from account' : '...'}
          searchPlaceholder="Search..."
          value={fromAccountId}
          onFocus={() => setFromAccountFocus(true)}
          onBlur={() => setFromAccountFocus(false)}
          onChange={(item: {value: string | null}) => {
            setFromAccountId(item.value);
            setFromAccountFocus(false);
          }}
        />

        {/* Dropdown for To Account */}
        <Dropdown
          style={[styles.dropdown, toAccountFocus && {borderColor: 'blue'}]}
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
          placeholder={!toAccountFocus ? 'Select to account' : '...'}
          searchPlaceholder="Search..."
          value={toAccountId}
          onFocus={() => setToAccountFocus(true)}
          onBlur={() => setToAccountFocus(false)}
          onChange={(item: {value: string | null}) => {
            setToAccountId(item.value);
            setToAccountFocus(false);
          }}
        />

        <TextInput
          placeholder="Enter amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          style={styles.input}
        />

        <Button
          title={transferId !== null ? 'Update Transfer' : 'Add Transfer'}
          onPress={handleAddOrUpdateTransfer}
        />
      </View>

      <FlatList
        data={transfers}
        renderItem={renderTransferItem}
        keyExtractor={item => item.id.toString()}
        style={{flex: 1}}
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
  transferItem: {
    flexDirection: 'column',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
});

export default TransferScreen;
