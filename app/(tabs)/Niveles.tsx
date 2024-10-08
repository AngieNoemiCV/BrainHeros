import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ProgressViewIOS, ProgressBarAndroid, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Importamos el hook para la navegación

// Definimos una interfaz para los niveles
interface Nivel {
  id: number;
  nombre: string;
  progreso: number; // 0 a 1, donde 1 es 100% completado
  completado: boolean;
}

const niveles: Nivel[] = [
  { id: 1, nombre: 'Nivel 1', progreso: 1, completado: true },
  { id: 2, nombre: 'Nivel 2', progreso: 0.5, completado: false },
  { id: 3, nombre: 'Nivel 3', progreso: 0.2, completado: false },
  { id: 4, nombre: 'Nivel 4', progreso: 0, completado: false },
  // Agrega más niveles según sea necesario
];

export default function Niveles() {
  const navigation = useNavigation();

  const renderNivel = ({ item }: { item: Nivel }) => {
    return (
      <View style={styles.nivelContainer}>
        <Text style={styles.nivelNombre}>{item.nombre}</Text>

        {/* Mostrar barra de progreso según plataforma */}
        {Platform.OS === 'ios' ? (
          <ProgressViewIOS progress={item.progreso} style={styles.progresoBar} />
        ) : (
          <ProgressBarAndroid styleAttr="Horizontal" progress={item.progreso} style={styles.progresoBar} />
        )}

        <TouchableOpacity
          style={styles.nivelButton}
          onPress={() => navigation.navigate('Desafios')} //, { nivelId: item.id }
          disabled={!item.completado && item.progreso === 0} // Si está bloqueado, no permitir navegar
        >
          <Text style={styles.nivelButtonText}>
            {item.progreso === 1 ? 'Completado' : 'Continuar'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={niveles}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNivel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  nivelContainer: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  nivelNombre: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#27613C',
  },
  progresoBar: {
    height: 10,
    marginBottom: 10,
  },
  nivelButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  nivelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
