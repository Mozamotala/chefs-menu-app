import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import React, { useState ,useEffect } from 'react';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function App() {
  const [name, setName] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [dishType, setDishType] = useState('');
  const [price, setPrice] = useState('');
  const [completed, setCompleted] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [searchItem, setSearchItem] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const clearForm = () => {
    setName('');
    setTime('');
    setDescription('');
    setPrice('');
    setDishType('');
    setEditingItemId(null);
  };

  const totalItems = menuItems.length;
  const totalPrice = menuItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
  const averagePrice = totalItems > 0 ? totalPrice / totalItems : 0;

  const editMenuItem = (idToEdit: string) => {
    const itemToEdit = menuItems.find((item) => item.id === idToEdit);
    if (itemToEdit) {
      setName(itemToEdit.name);
      setTime(itemToEdit.time);
      setDescription(itemToEdit.description);
      setPrice(itemToEdit.price);
      setDishType(itemToEdit.dishType);
      setEditingItemId(idToEdit);
    }
  };
    
  useEffect(() => {
    const loadSavedDishes = async () => {
      const savedData = await AsyncStorage.getItem('@dishes');
      if (savedData !== null) {
        setMenuItems(JSON.parse(savedData));
      }
    };
    loadSavedDishes();
  }, []);


  // Computes search values dynamically instantly across full rendering phases
  const displayedItems = menuItems.filter((dish) =>
    dish.name.toLowerCase().includes(searchItem.toLowerCase().trim())
  );
    // Handles removing a single item permanently by its ID
  const deleteMenuItem = async (idToDestroy: string) => {
    // 1. Filter out the specific dish from the array
    const updatedList = menuItems.filter((item) => item.id !== idToDestroy);
    
    // 2. Update screen state and overwrite storage disk files
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
              onPress={async () => { // 1. Added "async" here
                if (!name.trim()) { alert('Please enter the name of the dish.'); return; }
                if (!time.trim()) { alert('Please enter the time to cook.'); return; }
                if (!description.trim()) { alert('Please enter a description.'); return; }
                if (!price.trim()) { alert('Please enter a price.'); return; }
                if (isNaN(Number(price)) || Number(price) <= 0) {
                  alert('Please enter a valid number for the price.');
                  return;
                }
                if (!dishType) { alert('Please select a dish type.'); return; }

                
                setCompleted(true); 

                setTimeout(() => {
                  setCompleted(false);
                }, 1000);

                let updatedList;

                if (editingItemId) {
                  
                  updatedList = menuItems.map((item) =>
                    item.id === editingItemId
                      ? { ...item, name: name.trim(), time: time.trim(), description: description.trim(), price: price.trim(), dishType }
                      : item
                  ); 
                  
                  setMenuItems(updatedList);
                  await AsyncStorage.setItem('@dishes', JSON.stringify(updatedList));
                  clearForm();
                } else {
                  
                  const newItem = {
                    id: Date.now().toString(),
                    name: name.trim(),
                    time: time.trim(),
                    description: description.trim(),
                    price: price.trim(),
                    dishType: dishType,
                  };
                  
                  updatedList = [...menuItems, newItem];
                  setMenuItems(updatedList);
                  setName('');
                  setTime('');
                  setDescription('');
                  setPrice('');
                  setDishType('');
                  
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
                <Text style={styles.completedText}>Dish added successfully!</Text>
              </View>
            )}
          </View> 
          
      <TextInput
        value={searchItem}
        style={styles.searchBarInput}
        placeholder="Search menu items..."
        placeholderTextColor="#888"
        onChangeText={(text) => setSearchItem(text)}
      />

          
          <View style={{ marginTop: 10 }}>
            <Text style={styles.sectionHeader}>
              {searchItem ? `Search Results (${displayedItems.length})` 
              : `Menu Items (${menuItems.length}) 
              Total: R${totalPrice.toFixed(2)}
              Avg: R${averagePrice.toFixed(2)}`}
              
            </Text>
            
            {displayedItems.map((item) => (
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
            ))}
            

            {searchItem !== '' && displayedItems.length === 0 && (
              <Text style={styles.emptyText}>No matching dishes found.</Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <StatusBar style="auto" />
    </View>
  );
}

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

});
