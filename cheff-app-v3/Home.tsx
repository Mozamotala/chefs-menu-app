import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, KeyboardAvoidingView, ScrollView, Platform, Alert } from 'react-native';
import React, { useState ,useEffect } from 'react';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './navigation';


// this is my main screen, where the chef adds, edits, deletes and searches dishes
export default function App() {
  // lets me jump to the Details page later
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Home'>>();
  // these hold whatever the user types into the form
  const [name, setName] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [dishType, setDishType] = useState('');
  const [price, setPrice] = useState('');
  const [completed, setCompleted] = useState(false); // shows the little green "added" msg
  const [menuItems, setMenuItems] = useState<any[]>([]); // the full list of dishes
  const [searchItem, setSearchItem] = useState(''); // whats typed in the search bar
  // if this has an id, im editing that dish. if its null, im adding a new one
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  // pick a message for editing mode and a message when adding a new dish. if editingItemId has a value, we are in edit mode, otherwise we are in add mode
  const [successMessage, setSuccessMessage] = useState('');
  
  // wipes the form and gets me out of edit mode
  const clearForm = () => {
    setName('');
    setTime('');
    setDescription('');
    setPrice('');
    setDishType('');
    setEditingItemId(null);
  };

  // quick stats for the menu: how many dishes, total price and avg price
  const totalItems = menuItems.length;
  const totalPrice = menuItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
  const averagePrice = totalItems > 0 ? totalPrice / totalItems : 0;

  // EDIT: find the dish and pop its info back into the form so i can change it
  const editMenuItem = (idToEdit: string) => {
    const itemToEdit = menuItems.find((item) => item.id === idToEdit);
    if (itemToEdit) {
      setName(itemToEdit.name);
      setTime(itemToEdit.time);
      setDescription(itemToEdit.description);
      setPrice(itemToEdit.price);
      setDishType(itemToEdit.dishType);
      setEditingItemId(idToEdit); // this flips the button to "Save Changes"
    }
  };
    
  // runs once when the app opens and loads the dishes i saved last time
  useEffect(() => {
    const loadSavedDishes = async () => {
      const savedData = await AsyncStorage.getItem('@dishes');
      if (savedData !== null) {
        setMenuItems(JSON.parse(savedData));
      }
    };
    loadSavedDishes();
  }, []);


  // SEARCH: only keep dishes whose name has the search text in it (not case sensitive)
  const displayedItems = menuItems.filter((dish) =>
    dish.name.toLowerCase().includes(searchItem.toLowerCase().trim())
  );
  // DELETE: removes one dish for good using its id
  const deleteMenuItem = async (idToDestroy: string) => {
    // keep every dish except the one i want gone
    const updatedList = menuItems.filter((item) => item.id !== idToDestroy);
    
    // update the screen and save the new list so it stays deleted
    setMenuItems(updatedList);
    await AsyncStorage.setItem('@dishes', JSON.stringify(updatedList));
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chef's Menu</Text>
      <Text style={styles.subtitle}>Add a new menu item</Text>

      

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* the form to add / edit a dish */}
          <View style={styles.card}>
            <Text style={styles.label}>Dish Name</Text>
            <TextInput value={name} style={styles.input} placeholder="Name of dish" onChangeText={(text) => setName(text)} />

            <Text style={styles.label}>Time</Text>
            <TextInput value={time} style={styles.input} placeholder="Time to cook" onChangeText={(text) => setTime(text)} />

            <Text style={styles.label}>Description</Text>
            <TextInput value={description} style={styles.input} placeholder="Description" onChangeText={(text) => setDescription(text)} />

            <Text style={styles.label}>Price</Text>
            <TextInput value={price} keyboardType="numeric" style={styles.input} placeholder="Price" onChangeText={(text) => setPrice(text)} />

            <Text style={styles.label}>Dish Type</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={dishType}
                onValueChange={(itemValue) => setDishType(itemValue)}
                style={styles.dishType}
              >
                <Picker.Item label="Select a dish type" value="" />
                <Picker.Item label="Appetizer" value="appetizer" />
                <Picker.Item label="Main Course" value="mainCourse" />
                <Picker.Item label="Dessert" value="dessert" />
                <Picker.Item  label="Beverage" value="beverage" />
              </Picker>
            </View>

                        <TouchableOpacity 
              style={styles.submitButton}
              onPress={async () => { // async cause we wait for AsyncStorage to save
                // checks first - stop and tell the user if anything is missing or wrong
                if (!name.trim()) { alert('Please enter the name of the dish.'); return; }
                if (!time.trim()) { alert('Please enter the time to cook.'); return; }
                if (!description.trim()) { alert('Please enter a description.'); return; }
                if (!price.trim()) { alert('Please enter a price.'); return; }
                if (isNaN(Number(price)) || Number(price) <= 0) {
                  alert('Please enter a valid number for the price.');
                  return;
                }
                // high price - ask the user to confirm, only carry on if they press Continue
                if (Number(price) > 400) {
                  const message = `The price is R${price}. Are you sure about the price?`;
                  const confirmed = Platform.OS === 'web'
                    ? window.confirm(message)
                    : await new Promise<boolean>((resolve) => {
                        Alert.alert('Check price', message, [
                          { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
                          { text: 'Continue', onPress: () => resolve(true) },
                        ], { cancelable: true, onDismiss: () => resolve(false) });
                      });
                  if (!confirmed) return;
                }
                if (!dishType) { alert('Please select a dish type.'); return; }

                setSuccessMessage(editingItemId ? "Dish updated successfully!" : "Dish added successfully!")
                
  
                // show the success msg for 2 sec then hide it
                setCompleted(true); 

                setTimeout(() => {
                  setCompleted(false);
                }, 2000);

                let updatedList;

                if (editingItemId) {
                  // EDIT MODE: swap out the old dish with the updated info, keep the same id
                  updatedList = menuItems.map((item) =>
                    item.id === editingItemId
                      ? { ...item, name: name.trim(), time: time.trim(), description: description.trim(), price: price.trim(), dishType }
                      : item
                  ); 
                  
                  setMenuItems(updatedList);
                  await AsyncStorage.setItem('@dishes', JSON.stringify(updatedList));
                  clearForm();
                } else {
                  // ADD MODE: make a brand new dish, using the time as a unique id
                  const newItem = {
                    id: Date.now().toString(),
                    name: name.trim(),
                    time: time.trim(),
                    description: description.trim(),
                    price: price.trim(),
                    dishType: dishType,
                  };
                  
                  // add it to the end of the list, then clear the form
                  updatedList = [...menuItems, newItem];
                  setMenuItems(updatedList);
                  setName('');
                  setTime('');
                  setDescription('');
                  setPrice('');
                  setDishType('');
                  
                  // save to the phone so it's still there after closing the app
                  await AsyncStorage.setItem('@dishes', JSON.stringify(updatedList));
                }
              }} 
            >
              
              <Text style={styles.submitButtonText}>
                {editingItemId ? "Save Changes" : "Submit"}
              </Text>
            </TouchableOpacity>


            {completed && (
              <View style={styles.completedContainer}>
                <Text style={styles.completedText}>{successMessage}</Text>
              </View>
            )}
          </View> 
          
      {/* search bar - filters the list as you type */}
      <TextInput
        value={searchItem}
        style={styles.searchBarInput}
        placeholder="Search menu items..."
        placeholderTextColor="#888"
        onChangeText={(text) => setSearchItem(text)}
      />

          
          <View style={{ marginTop: 10 }}>
            <Text style={styles.sectionHeader}>
              {searchItem ? `Search Results (${displayedItems.length})`:
                `Menu Items (${menuItems.length})\nTotal: R${totalPrice.toFixed(2)}\nAvg: R${averagePrice.toFixed(2)}`}
            </Text>
            {/* ternary = condition ? if true : if false. no dishes shows a msg, otherwise show the list */}
            {displayedItems.length === 0 ? (
              <Text>{searchItem ? `No matching dishes found.` : `No menu items available. Please add a new dish.`}</Text>
            ) : (

            // one card for each dish
            displayedItems.map((item) => (
              <View key={item.id} style={styles.card}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#333' }}>{item.name}</Text>
                <Text style={styles.itemDetailText}>Time: {item.time}</Text>
                <Text style={styles.itemDetailText}>Description: {item.description}</Text>
                <Text style={styles.itemDetailText}>Price: R{item.price}</Text>
                <Text style={styles.itemDetailText}>Dish Type: {item.dishType}</Text>

                   <TouchableOpacity 
                     style={styles.deleteButton}
                     onPress={() => deleteMenuItem(item.id)}
                     >
                   <Text style={styles.deleteButtonText}>Delete Dish</Text>
                   </TouchableOpacity>

                   <TouchableOpacity 
                     style={styles.editButton}
                     onPress={() => editMenuItem(item.id)}
                     >
                   <Text style={styles.editButtonText}>Edit Dish</Text>
                   </TouchableOpacity>

                   

              </View>
            ))
          )}
            

            {searchItem !== '' && displayedItems.length === 0 && (
              <Text style={styles.emptyText}>No matching dishes found.</Text>
            )}

            {/* goes to the Details page and sends the dishes along with it */}
            <TouchableOpacity 
            style={styles.detailsButton}
            onPress={() => {
              navigation.navigate('Details', { menuItems });
            }}
          >
          <Text style={styles.detailsButtonText}>Details</Text>
        </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <StatusBar style="auto" />
    
    </View>
  );
}

// all the styling for this screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 50,
  },
  searchBarInput: {
    borderWidth: 1,
    borderColor: '#ff506a',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  label: {
    fontWeight: '600',
    color: '#444',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  dishType: {
    width: '100%',
    ...Platform.select({
      android: { height: 50 },
    }),
  },
  submitButton: {
    backgroundColor: '#ff506a',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  completedContainer: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#d4edda',
    borderRadius: 8,
  },
  completedText: {
    color: '#155724',
    fontSize: 15,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollContainer: {
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#222',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  itemDetailText: {
    marginTop: 4,
    color: '#666',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 30,
    fontSize: 16,
  },
    deleteButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
    editButton: {
    backgroundColor: '#1682fe',
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  detailsButton: {
    backgroundColor: '#28a745',
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

});
