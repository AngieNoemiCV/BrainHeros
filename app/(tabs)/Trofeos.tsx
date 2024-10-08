// Trofeos.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

export default function Trofeos() {
  // Aquí defines un array de trofeos (ejemplo estático)
  const trofeos = [
    { id: '1', nombre: 'Trofeo de Oro', descripcion: 'Obtenido al completar todos los niveles.' },
    { id: '2', nombre: 'Trofeo de Plata', descripcion: 'Obtenido al completar la mitad de los niveles.' },
    { id: '3', nombre: 'Trofeo de Bronce', descripcion: 'Obtenido al completar 3 niveles.' },
  ];

  const renderItem = ({ item }) => (
    <View style={styles.trofeo}>
      <Text style={styles.trofeoNombre}>{item.nombre}</Text>
      <Text style={styles.trofeoDescripcion}>{item.descripcion}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tus Trofeos</Text>
      <FlatList
        data={trofeos}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  trofeo: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    width: '100%',
  },
  trofeoNombre: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  trofeoDescripcion: {
    fontSize: 14,
    color: '#666',
  },
});
