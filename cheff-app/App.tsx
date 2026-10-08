import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Picker } from '@react-native-picker/picker';

// Dishes the menu starts with
const startingDishes = [
  { id: '1', name: 'Cheesey Garlic Prawns', description: '8 prawns in a cheesey garlic sauce', price: 79.99, course: 'Starter' },
  { id: '2', name: 'Double Rib Burger', description: '2 rib patties with mushroom sauce and fries', price: 149.99, course: 'Main Course' },
  { id: '3', name: 'Strawberry Cinnamon Roll', description: 'Cinnamon roll with strawberry jam and cream', price: 49.99, course: 'Dessert' },
];

export default function App() {
  // The list of dishes on the menu
  const [dishes, setDishes] = useState(startingDishes);

  // What the user is typing in the form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [course, setCourse] = useState('Starter');

  const addDish = () => {
    // Check the form is filled in
    if (name === '' || description === '' || price === '') {
      alert('Please fill in all the fields.');
      return;
    }
    if (isNaN(Number(price)) || Number(price) <= 0) {
      alert('Please enter a valid price.');
      return;
    }

    // Make the new dish and add it to the list
    const newDish = {
      id: Date.now().toString(),
      name: name,
      description: description,
      price: Number(price),
      course: course,
    };
    setDishes([...dishes, newDish]);

    // Empty the form
    setName('');
    setDescription('');
    setPrice('');
    setCourse('Starter');
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Chef's Menu</Text>

        {/* The form */}
        <View style={styles.card}>
          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Dish name" />

          <Text style={styles.label}>Description</Text>
          <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="Dish description" />

          <Text style={styles.label}>Price</Text>
          <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="Price" keyboardType="numeric" />

          <Text style={styles.label}>Course</Text>
          <Picker selectedValue={course} onValueChange={setCourse}>
            <Picker.Item label="Starter" value="Starter" />
            <Picker.Item label="Main Course" value="Main Course" />
            <Picker.Item label="Dessert" value="Dessert" />
          </Picker>

          <TouchableOpacity style={styles.button} onPress={addDish}>
            <Text style={styles.buttonText}>Add Dish</Text>
          </TouchableOpacity>
        </View>

        {/* The menu */}
        <Text style={styles.heading}>Menu ({dishes.length} dishes)</Text>

        {dishes.map((dish) => (
          <View key={dish.id} style={styles.card}>
            <Text style={styles.dishName}>{dish.name}</Text>
            <Text>{dish.course}</Text>
            <Text>{dish.description}</Text>
            <Text style={styles.price}>R{dish.price.toFixed(2)}</Text>
          </View>
        ))}
      </ScrollView>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dishName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  price: {
    fontWeight: 'bold',
    marginTop: 5,
  },
});
