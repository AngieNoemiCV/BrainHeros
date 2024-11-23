import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors['light'].tint,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="Panel"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Niveles"
        options={{
          title: 'Niveles',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'checkmark-circle' : 'checkmark-circle'} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="Trofeos"
        options={{
          title: 'Trofeos',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'trophy' : 'trophy-outline'} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="Perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'person' : 'person'} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="Desafios"
        options={{
          href: null,
          title: 'Desafios',
        }}
      />

      <Tabs.Screen
        name="Presentacion"
        options={{
          href: null,
          title: 'Presentacion',
        }}
      />

      {/* <Tabs.Screen
        name="Administrador"
        options={{
          href: null,
          title: 'Presentacion',
        }}
      /> */}

      <Tabs.Screen
        name="LoginPatron"
        options={{
          href: null,
          title: 'Presentacion',
        }}
      />

      <Tabs.Screen
        name="AdminAdd"
        options={{
          href: null,
          title: 'Presentacion',
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          href: null,
          title: 'Presentacion',
        }}
      />

      <Tabs.Screen
        name="EditPregunta"
        options={{
          href: null,
          title: 'Presentacion',
        }}
      />

      <Tabs.Screen
        name="AdminUsuarios"
        options={{
          href: null,
          title: 'Presentacion',
        }}
      />

      <Tabs.Screen
        name="AdminPreguntas"
        options={{
          href: null,
          title: 'Presentacion',
        }}
      />

    </Tabs>
  );
}
