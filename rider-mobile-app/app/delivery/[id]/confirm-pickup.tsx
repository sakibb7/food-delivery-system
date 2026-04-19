import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function ConfirmPickupScreen() {
  const router = useRouter();
  const [itemsChecked, setItemsChecked] = useState([false, false]);

  const allChecked = itemsChecked.every(Boolean);

  const toggleCheck = (index: number) => {
    const newItems = [...itemsChecked];
    newItems[index] = !newItems[index];
    setItemsChecked(newItems);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="chevron-back" color="#374151" size={24} />
        </TouchableOpacity>
        <Text className="text-lg font-bold ml-2">Confirm Order Pickup</Text>
      </View>

      <ScrollView className="flex-1 p-6">
        <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <Text className="text-gray-500 mb-1">Order Number</Text>
          <Text className="text-3xl font-bold text-gray-900">#BK-8472</Text>
        </View>

        <Text className="text-lg font-bold text-gray-900 mb-4">Checklist Items</Text>
        
        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <TouchableOpacity 
            className="flex-row items-center p-4 border-b border-gray-50"
            onPress={() => toggleCheck(0)}
          >
            <View className={`w-6 h-6 rounded border ${itemsChecked[0] ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'} items-center justify-center mr-4`}>
              {itemsChecked[0] && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <View>
              <Text className="font-bold text-gray-900 text-lg">2x Whopper Meal</Text>
              <Text className="text-gray-500">Includes Fries & Coke</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-row items-center p-4"
            onPress={() => toggleCheck(1)}
          >
             <View className={`w-6 h-6 rounded border ${itemsChecked[1] ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'} items-center justify-center mr-4`}>
              {itemsChecked[1] && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <View>
              <Text className="font-bold text-gray-900 text-lg">1x Onion Rings</Text>
              <Text className="text-gray-500">Large size</Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>

      <View className="p-6 bg-white border-t border-gray-100">
        <TouchableOpacity 
          className={`w-full py-4 rounded-xl items-center ${allChecked ? 'bg-emerald-500' : 'bg-gray-300'}`}
          disabled={!allChecked}
          onPress={() => router.push('/delivery/123/dropoff')}
        >
          <Text className="text-white font-bold text-lg">Confirm Pickup</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
