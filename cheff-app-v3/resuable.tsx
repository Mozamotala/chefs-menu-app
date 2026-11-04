// all my reusable stuff lives here - written once, used on the Home and Details screens
import { StyleSheet, TextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// the 4 dish types - value is what gets saved, label is what the chef sees
// used by the Home picker and the Details cards so they always match
export const dishTypes = [
  { value: "appetizer", label: "Appetizer" },
  { value: "mainCourse", label: "Main Course" },
  { value: "dessert", label: "Dessert" },
  { value: "beverage", label: "Beverage" },
];

// SEARCH: gives back only the dishes whose name has the search text in it
// ignores capitals and extra spaces. empty search = every dish
export function searchDishes(dishes: any[], searchText: string) {
  return dishes.filter((dish) =>
    dish.name.toLowerCase().includes(searchText.toLowerCase().trim()),
  );
}

// TOTAL: adds up the price of every dish (bad prices count as 0)
export function getTotalPrice(dishes: any[]) {
  return dishes.reduce((sum, dish) => sum + (parseFloat(dish.price) || 0), 0);
}

// AVERAGE: total divided by how many dishes. 0 if there are none (no NaN)
export function getAveragePrice(dishes: any[]) {
  return dishes.length > 0 ? getTotalPrice(dishes) / dishes.length : 0;
}

// SAVE: stores the dish list on the phone so it's still there after closing the app
export async function saveDishes(dishes: any[]) {
  await AsyncStorage.setItem("@dishes", JSON.stringify(dishes));
}

// SEARCH BAR: the same search box for both screens
// value = what's typed, onChange = what to do when the user types
export function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (text: string) => void;
}) {
  return (
    <TextInput
      value={value}
      style={styles.searchBar}
      placeholder="Search dishes..."
      placeholderTextColor="#888"
      onChangeText={onChange}
    />
  );
}

const styles = StyleSheet.create({
  searchBar: {
    borderWidth: 1,
    borderColor: "#ff506a",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#fff",
  },
});
