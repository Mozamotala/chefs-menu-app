import { useState } from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "./navigation";
import {
  dishTypes,
  searchDishes,
  getTotalPrice,
  getAveragePrice,
  SearchBar,
} from "./resuable";
import { Picker } from "@react-native-picker/picker";

type Props = NativeStackScreenProps<RootStackParamList, "Details">;

// second page: shows all dishes grouped by category
export default function Details({ route }: Props) {
  // grab the dishes that Home sent over
  const { menuItems } = route.params;

  // how many dishes there are, and their prices added up (bad prices count as 0)
  const totalItems = menuItems.length;
  const totalPrice = getTotalPrice(menuItems);

  // search text typed by the user, used to filter dishes by name
  const [searchItem, setSearchItem] = useState("");
  // only the dishes that match the search (all of them if the search is empty)
  const results = searchDishes(menuItems, searchItem);

  const [selectedType, setSelectedType] = useState("");

  return (
    // everything on screen lives inside this ScrollView so the page can scroll
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}
    >
      {/* search box (from resuable.tsx) - every letter typed updates searchItem */}
      <SearchBar value={searchItem} onChange={setSearchItem} />

      <Picker
        style={styles.pickerWrapper}
        selectedValue={selectedType}
        onValueChange={(itemValue) => setSelectedType(itemValue)}
      >
        <Picker.Item label="All Categories" value="" />
        {dishTypes.map((type) => (
          <Picker.Item key={type.value} label={type.label} value={type.value} />
        ))}
      </Picker>

      {/* summary card - total dishes and total value of the whole menu */}
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>Summary</Text>
        <Text style={styles.itemDetailText}>Total dishes: {totalItems}</Text>
        <Text style={styles.itemDetailText}>
          Total value: R{totalPrice.toFixed(2)}
        </Text>
      </View>

      {/* if something is typed but no dish name matches, show a message */}
      {searchItem.trim() !== "" && results.length === 0 && (
        <Text style={styles.emptyText}>Cannot find any matching dishes.</Text>
      )}

      {/* make one card per category */}
      {dishTypes.map((type) => {
        if (selectedType && type.value !== selectedType) return null;

        // only the matching dishes in this category, plus their avg price
        const dishes = results.filter((item) => item.dishType === type.value);
        const average = getAveragePrice(dishes);

        // while searching, hide categories with no matching dishes
        if (searchItem && dishes.length === 0) return null;

        // one card: category name + count, average price, then each dish
        return (
          <View
            key={type.value}
            style={
              styles.card
            } /*type = category value =appatiser , maincourse ext   */
          >
            <Text style={styles.sectionHeader}>
              {type.label} ({dishes.length})
            </Text>
            <Text style={styles.itemDetailText}>
              Average price: R{average.toFixed(2)}
            </Text>

            {/* .map goes through every dish in this category one by one.
                item = the dish it's on right now (I picked the name "item").
                everything after => is MY rules: make one row showing that dish's
                name, description, time and price. 3 dishes = 3 rows.
                key={item.id} gives each row a unique id so React can tell them apart */}
            {dishes.map((item) => (
              <View key={item.id} style={styles.dishRow}>
                <Text style={styles.dishName}>{item.name}</Text>
                <Text style={styles.itemDetailText}>{item.description}</Text>
                <Text style={styles.itemDetailText}>
                  Time: {item.time} · R{item.price}
                </Text>
              </View>
            ))}

            {/* only shows when the category has no dishes at all */}
            {
              dishes.length === 0 && (
                <Text style={styles.emptyText}>No dishes yet.</Text>
              )
              /* .length is  reacts way of counting items so dish.lenght is leteraly how many dishes there are */
            }
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  dishRow: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
    marginTop: 10,
  },
  dishName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#ff506a",
  },
  itemDetailText: {
    marginTop: 4,
    color: "#666",
    fontSize: 14,
  },
  emptyText: {
    marginTop: 10,
    color: "#999",
    fontStyle: "italic",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
});
