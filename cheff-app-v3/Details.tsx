import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from './navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Details'>;

const dishTypes = [
  { value: 'appetizer', label: 'Appetizer' },
  { value: 'mainCourse', label: 'Main Course' },
  { value: 'dessert', label: 'Dessert' },
  { value: 'beverage', label: 'Beverage' },
];

export default function Details({ route }: Props) {
  const { menuItems } = route.params;

  const totalItems = menuItems.length;
  const totalPrice = menuItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>Summary</Text>
        <Text style={styles.itemDetailText}>Total dishes: {totalItems}</Text>
        <Text style={styles.itemDetailText}>Total value: R{totalPrice.toFixed(2)}</Text>
      </View>

      {dishTypes.map((type) => {
        const dishes = menuItems.filter((item) => item.dishType === type.value);
        const total = dishes.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
        const average = dishes.length > 0 ? total / dishes.length : 0;

        return (
          <View key={type.value} style={styles.card}>
            <Text style={styles.sectionHeader}>
              {type.label} ({dishes.length})
            </Text>
            <Text style={styles.itemDetailText}>Average price: R{average.toFixed(2)}</Text>

            {dishes.map((item) => (
              <View key={item.id} style={styles.dishRow}>
                <Text style={styles.dishName}>{item.name}</Text>
                <Text style={styles.itemDetailText}>{item.description}</Text>
                <Text style={styles.itemDetailText}>Time: {item.time} · R{item.price}</Text>
              </View>
            ))}

            {dishes.length === 0 && <Text style={styles.emptyText}>No dishes yet.</Text>}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
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
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  dishRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    marginTop: 10,
  },
  dishName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#ff506a',
  },
  itemDetailText: {
    marginTop: 4,
    color: '#666',
    fontSize: 14,
  },
  emptyText: {
    marginTop: 10,
    color: '#999',
    fontStyle: 'italic',
  },
});
